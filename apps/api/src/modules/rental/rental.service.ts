import { prisma } from '../../lib/prisma'
import { dispatchWebhook } from '../../utils/webhook'

interface CheckoutInput {
  equipmentId: string
  clientId: string
  checkoutDate: string
  checkoutNotes?: string
  dailyRate: number
}

interface CheckinInput {
  checkinCondition: 'GREAT' | 'GOOD' | 'BAD' | 'DAMAGED'
  checkinNotes?: string
}

export async function checkout(input: CheckoutInput, userId: string) {
  const equipment = await prisma.equipment.findUnique({ where: { id: input.equipmentId } })
  if (!equipment) throw new Error('Veiculo nao encontrado')
  if (equipment.status !== 'AVAILABLE') throw new Error('Veiculo nao disponivel para locacao')

  const client = await prisma.client.findUnique({ where: { id: input.clientId } })
  if (!client) throw new Error('Cliente nao encontrado')

  const rental = await prisma.rental.create({
    data: {
      equipmentId: input.equipmentId,
      clientId: input.clientId,
      checkedOutById: userId,
      checkoutDate: new Date(input.checkoutDate),
      checkoutNotes: input.checkoutNotes,
      dailyRate: input.dailyRate,
      checkoutPhotos: [],
    },
    include: { equipment: true, client: true },
  })

  await prisma.equipment.update({
    where: { id: input.equipmentId },
    data: { status: 'RENTED' },
  })

  await dispatchWebhook({
    event: 'rental.checkout',
    timestamp: new Date().toISOString(),
    data: {
      rentalId: rental.id,
      equipment: { id: equipment.id, name: equipment.name, category: equipment.category },
      client: { id: client.id, name: client.name, email: client.email },
      checkoutDate: input.checkoutDate,
      dailyRate: input.dailyRate,
    },
  })

  return rental
}

export async function checkin(rentalId: string, input: CheckinInput, userId: string) {
  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { equipment: true, client: true },
  })
  if (!rental) throw new Error('Locacao nao encontrada')
  if (rental.checkinDate) throw new Error('Devolucao ja registrada')

  const checkinDate = new Date()
  const checkoutDate = new Date(rental.checkoutDate)
  const totalDays = Math.max(1, Math.ceil((checkinDate.getTime() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24)))
  const totalAmount = totalDays * Number(rental.dailyRate)

  const updated = await prisma.rental.update({
    where: { id: rentalId },
    data: {
      checkinDate,
      checkedInById: userId,
      checkinCondition: input.checkinCondition,
      checkinNotes: input.checkinNotes,
      totalDays,
      totalAmount,
      checkinPhotos: [],
    },
    include: { equipment: true, client: true },
  })

  await prisma.equipment.update({
    where: { id: rental.equipmentId },
    data: { status: input.checkinCondition === 'DAMAGED' ? 'MAINTENANCE' : 'AVAILABLE' },
  })

  await dispatchWebhook({
    event: 'rental.checkin',
    timestamp: new Date().toISOString(),
    data: {
      rentalId: rental.id,
      equipment: { id: rental.equipment.id, name: rental.equipment.name },
      client: { id: rental.client.id, name: rental.client.name, email: rental.client.email },
      totalDays,
      totalAmount,
      condition: input.checkinCondition,
      damaged: input.checkinCondition === 'DAMAGED',
    },
  })

  return updated
}

export async function list() {
  return prisma.rental.findMany({
    include: {
      equipment: { select: { id: true, name: true, category: true, status: true } },
      client: { select: { id: true, name: true, email: true } },
      checkedOutBy: { select: { id: true, name: true } },
      checkedInBy: { select: { id: true, name: true } },
    },
    orderBy: { checkoutDate: 'desc' },
  })
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
