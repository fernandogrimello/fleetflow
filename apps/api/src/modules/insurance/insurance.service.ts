import { prisma } from '../../lib/prisma'

interface CreateInsuranceInput {
  equipmentId: string
  policyNumber: string
  insurer: string
  insuredValue: number
  premium: number
  startDate: string
  endDate: string
  coverage?: string
}

interface CreateClaimInput {
  description: string
  claimDate: string
  amount?: number
  notes?: string
}

export async function create(data: CreateInsuranceInput) {
  const equipment = await prisma.equipment.findUnique({ where: { id: data.equipmentId } })
  if (!equipment) throw new Error('Equipamento nao encontrado')

  const existing = await prisma.insurance.findUnique({ where: { equipmentId: data.equipmentId } })
  if (existing) throw new Error('Equipamento ja possui apolice ativa')

  return prisma.insurance.create({
    data: {
      equipmentId: data.equipmentId,
      policyNumber: data.policyNumber,
      insurer: data.insurer,
      insuredValue: data.insuredValue,
      premium: data.premium,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      coverage: data.coverage,
    },
    include: { equipment: { select: { id: true, name: true } } },
  })
}

export async function getByEquipment(equipmentId: string) {
  const insurance = await prisma.insurance.findUnique({
    where: { equipmentId },
    include: { claims: { orderBy: { claimDate: 'desc' } } },
  })
  if (!insurance) throw new Error('Apolice nao encontrada para este equipamento')
  return insurance
}

export async function createClaim(insuranceId: string, data: CreateClaimInput) {
  const insurance = await prisma.insurance.findUnique({ where: { id: insuranceId } })
  if (!insurance) throw new Error('Apolice nao encontrada')

  return prisma.claim.create({
    data: {
      insuranceId,
      description: data.description,
      claimDate: new Date(data.claimDate),
      amount: data.amount,
      notes: data.notes,
    },
  })
}

export async function getExpiringPolicies(daysAhead = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + daysAhead)

  return prisma.insurance.findMany({
    where: { endDate: { lte: cutoff } },
    include: {
      equipment: { select: { id: true, name: true, category: true } },
      claims: true,
    },
    orderBy: { endDate: 'asc' },
  })
}

export async function renewInsurance(id: string, data: {
  policyNumber: string
  premium: number
  startDate: string
  endDate: string
}) {
  const insurance = await prisma.insurance.findUnique({ where: { id } })
  if (!insurance) throw new Error('Apolice nao encontrada')

  return prisma.insurance.update({
    where: { id },
    data: {
      policyNumber: data.policyNumber,
      premium: data.premium,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
    include: { equipment: { select: { id: true, name: true } } },
  })
}
