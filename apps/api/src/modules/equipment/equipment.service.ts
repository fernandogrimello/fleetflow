import { prisma } from '../../lib/prisma'
import { EquipmentStatus } from '@prisma/client'

interface CreateEquipmentInput {
  name: string
  category: string
  brand: string
  model: string
  year: number
  serialNumber: string
  dailyRate: number
  purchasePrice: number
}

interface UpdateEquipmentInput extends Partial<CreateEquipmentInput> {
  status?: EquipmentStatus
}

interface ListEquipmentInput {
  status?: EquipmentStatus
  category?: string
  search?: string
  page?: number
  limit?: number
}

export async function create(data: CreateEquipmentInput) {
  const existing = await prisma.equipment.findUnique({
    where: { serialNumber: data.serialNumber },
  })
  if (existing) throw new Error('Numero de serie ja cadastrado')

  return prisma.equipment.create({ data })
}

export async function list(input: ListEquipmentInput = {}) {
  const { status, category, search, page = 1, limit = 20 } = input
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (category) where.category = category
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.equipment.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.equipment.count({ where }),
  ])

  return { items, total, page, limit, pages: Math.ceil(total / limit) }
}

export async function getById(id: string) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      rentals: { orderBy: { createdAt: 'desc' }, take: 10 },
      maintenances: { orderBy: { createdAt: 'desc' }, take: 10 },
      insurance: true,
    },
  })
  if (!equipment) throw new Error('Equipamento nao encontrado')
  return equipment
}

export async function update(id: string, data: UpdateEquipmentInput) {
  await getById(id)
  return prisma.equipment.update({ where: { id }, data })
}

export async function decommission(id: string) {
  const equipment = await getById(id)
  if (equipment.status === 'RENTED') {
    throw new Error('Nao e possivel baixar um equipamento alugado')
  }
  return prisma.equipment.update({
    where: { id },
    data: { status: 'DECOMMISSIONED' },
  })
}

export async function addPhotos(id: string, filenames: string[]) {
  const equipment = await getById(id)
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001'
  const newPhotos = filenames.map(f => `${baseUrl}/uploads/${f}`)
  return prisma.equipment.update({
    where: { id },
    data: { photos: { push: newPhotos } },
  })
}

export async function generateAndSaveQRCode(id: string) {
  const { generateQRCode } = await import('../../utils/qrcode')
  const qrCode = await generateQRCode(id)
  return prisma.equipment.update({
    where: { id },
    data: { qrCode },
    select: { id: true, name: true, qrCode: true },
  })
}

export async function getPublic(id: string) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      category: true,
      brand: true,
      model: true,
      year: true,
      status: true,
      photos: true,
      dailyRate: true,
    },
  })
  if (!equipment) throw new Error('Equipamento nao encontrado')
  return equipment
}

export async function removePhoto(id: string, photoUrl: string) {
  const equipment = await getById(id)
  const updatedPhotos = equipment.photos.filter((p: string) => p !== photoUrl)
  return prisma.equipment.update({
    where: { id },
    data: { photos: updatedPhotos },
  })
}
