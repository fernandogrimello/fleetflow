import { prisma } from '../../lib/prisma'
import { MaintenanceType } from '@prisma/client'

interface ScheduleInput {
  equipmentId: string
  type: MaintenanceType
  description: string
  scheduledDate: string
  scheduledById: string
}

interface ServiceOrderInput {
  technicianName: string
  executedDate: string
  laborCost: number
  parts: { name: string; quantity: number; unitPrice: number }[]
}

interface ReleaseInput {
  releasedById: string
  releaseNotes?: string
}

export async function schedule(data: ScheduleInput) {
  const equipment = await prisma.equipment.findUnique({ where: { id: data.equipmentId } })
  if (!equipment) throw new Error('Equipamento nao encontrado')
  if (equipment.status === 'RENTED') throw new Error('Equipamento esta alugado e nao pode ser agendado para manutencao')

  const maintenance = await prisma.maintenance.create({
    data: {
      equipmentId: data.equipmentId,
      type: data.type,
      description: data.description,
      scheduledDate: new Date(data.scheduledDate),
      scheduledById: data.scheduledById,
    },
    include: { equipment: { select: { id: true, name: true } }, scheduledBy: { select: { id: true, name: true } } },
  })

  await prisma.equipment.update({ where: { id: data.equipmentId }, data: { status: 'MAINTENANCE' } })

  return maintenance
}

export async function createServiceOrder(maintenanceId: string, data: ServiceOrderInput) {
  const maintenance = await prisma.maintenance.findUnique({ where: { id: maintenanceId } })
  if (!maintenance) throw new Error('Manutencao nao encontrada')
  if (maintenance.executedDate) throw new Error('Ordem de servico ja registrada')

  const partsTotal = data.parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0)

  return prisma.maintenance.update({
    where: { id: maintenanceId },
    data: {
      technicianName: data.technicianName,
      executedDate: new Date(data.executedDate),
      laborCost: data.laborCost,
      parts: {
        create: data.parts.map(p => ({
          name: p.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        })),
      },
    },
    include: { parts: true, equipment: { select: { id: true, name: true } } },
  })
}

export async function release(maintenanceId: string, data: ReleaseInput) {
  const maintenance = await prisma.maintenance.findUnique({
    where: { id: maintenanceId },
    include: { equipment: true },
  })
  if (!maintenance) throw new Error('Manutencao nao encontrada')
  if (maintenance.releaseDate) throw new Error('Equipamento ja foi liberado')

  const [updated] = await prisma.$transaction([
    prisma.maintenance.update({
      where: { id: maintenanceId },
      data: {
        releasedById: data.releasedById,
        releaseDate: new Date(),
        releaseNotes: data.releaseNotes,
      },
      include: { parts: true, equipment: { select: { id: true, name: true } } },
    }),
    prisma.equipment.update({
      where: { id: maintenance.equipmentId },
      data: { status: 'AVAILABLE' },
    }),
  ])

  return updated
}

export async function listByEquipment(equipmentId: string) {
  return prisma.maintenance.findMany({
    where: { equipmentId },
    orderBy: { scheduledDate: 'desc' },
    include: {
      parts: true,
      scheduledBy: { select: { id: true, name: true } },
      releasedBy: { select: { id: true, name: true } },
    },
  })
}

export async function getById(id: string) {
  const maintenance = await prisma.maintenance.findUnique({
    where: { id },
    include: {
      parts: true,
      equipment: { select: { id: true, name: true } },
      scheduledBy: { select: { id: true, name: true } },
      releasedBy: { select: { id: true, name: true } },
    },
  })
  if (!maintenance) throw new Error('Manutencao nao encontrada')
  return maintenance
}
