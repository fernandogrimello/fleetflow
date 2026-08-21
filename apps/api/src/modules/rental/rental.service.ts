import { prisma } from '../../lib/prisma'
import { RentalCondition } from '@prisma/client'

interface CheckoutInput {
  equipmentId: string
  clientId: string
  checkedOutById: string
  checkoutDate: string
  checkoutNotes?: string
}

interface CheckinInput {
  checkedInById: string
  checkinDate: string
  checkinCondition: RentalCondition
  checkinNotes?: string
}

export async function checkout(data: CheckoutInput) {
  const equipment = await prisma.equipment.findUnique({ where: { id: data.equipmentId } })
  if (!equipment) throw new Error('Equipamento nao encontrado')
  if (equipment.status !== 'AVAILABLE') throw new Error('Equipamento nao esta disponivel para locacao')

  const client = await prisma.client.findUnique({ where: { id: data.clientId } })
  if (!client) throw new Error('Cliente nao encontrado')

  const [rental] = await prisma.$transaction([
    prisma.rental.create({
      data: {
        equipmentId: data.equipmentId,
        clientId: data.clientId,
        checkedOutById: data.checkedOutById,
        checkoutDate: new Date(data.checkoutDate),
        checkoutNotes: data.checkoutNotes,
        dailyRate: equipment.dailyRate,
      },
      include: { equipment: true, client: true, checkedOutBy: { select: { id: true, name: true } } },
    }),
    prisma.equipment.update({ where: { id: data.equipmentId }, data: { status: 'RENTED' } }),
  ])

  return rental
}

export async function checkin(rentalId: string, data: CheckinInput) {
  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { equipment: true },
  })
  if (!rental) throw new Error('Locacao nao encontrada')
  if (rental.checkinDate) throw new Error('Check-in ja realizado para esta locacao')

  const checkinDate = new Date(data.checkinDate)
  const checkoutDate = new Date(rental.checkoutDate)
  const totalDays = Math.max(1, Math.ceil((checkinDate.getTime() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24)))
  const totalAmount = Number(rental.dailyRate) * totalDays

  const [updatedRental] = await prisma.$transaction([
    prisma.rental.update({
      where: { id: rentalId },
      data: {
        checkedInById: data.checkedInById,
        checkinDate,
        checkinCondition: data.checkinCondition,
        checkinNotes: data.checkinNotes,
        totalDays,
        totalAmount,
      },
      include: { equipment: true, client: true },
    }),
    prisma.equipment.update({
      where: { id: rental.equipmentId },
      data: { status: data.checkinCondition === 'DAMAGED' ? 'MAINTENANCE' : 'AVAILABLE' },
    }),
  ])

  return updatedRental
}

export async function list(filters: { clientId?: string; equipmentId?: string; page?: number; limit?: number } = {}) {
  const { clientId, equipmentId, page = 1, limit = 20 } = filters
  const skip = (page - 1) * limit
  const where: Record<string, unknown> = {}
  if (clientId) where.clientId = clientId
  if (equipmentId) where.equipmentId = equipmentId

  const [items, total] = await Promise.all([
    prisma.rental.findMany({
      where,
      skip,
      take: limit,
      orderBy: { checkoutDate: 'desc' },
      include: {
        equipment: { select: { id: true, name: true, category: true } },
        client: { select: { id: true, name: true } },
        checkedOutBy: { select: { id: true, name: true } },
        checkedInBy: { select: { id: true, name: true } },
      },
    }),
    prisma.rental.count({ where }),
  ])

  return { items, total, page, limit, pages: Math.ceil(total / limit) }
}

export async function getById(id: string) {
  const rental = await prisma.rental.findUnique({
    where: { id },
    include: {
      equipment: true,
      client: true,
      checkedOutBy: { select: { id: true, name: true } },
      checkedInBy: { select: { id: true, name: true } },
    },
  })
  if (!rental) throw new Error('Locacao nao encontrada')
  return rental
}
