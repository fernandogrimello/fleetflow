import { prisma } from '../../lib/prisma'
import { uploadImage, deleteImage } from '../../utils/cloudinary'
import { generateQRCode } from '../../utils/qrcode'

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

export async function list(params?: { search?: string; status?: string; category?: string; page?: number; limit?: number }) {
  const where: any = {}
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { brand: { contains: params.search, mode: 'insensitive' } },
      { model: { contains: params.search, mode: 'insensitive' } },
      { serialNumber: { contains: params.search, mode: 'insensitive' } },
    ]
  }
  if (params?.status) where.status = params.status
  if (params?.category) where.category = params.category

  const [items, total] = await Promise.all([
    prisma.equipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.equipment.count({ where }),
  ])

  return { items, total }
}

export async function getById(id: string) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      rentals: { include: { client: true }, orderBy: { checkoutDate: 'desc' } },
      maintenances: { include: { parts: true }, orderBy: { scheduledDate: 'desc' } },
    },
  })
  if (!equipment) throw new Error('Veículo não encontrado')
  return equipment
}

export async function create(data: CreateEquipmentInput) {
  return prisma.equipment.create({ data })
}

export async function update(id: string, data: Partial<CreateEquipmentInput>) {
  return prisma.equipment.update({ where: { id }, data })
}

export async function decommission(id: string) {
  return prisma.equipment.update({
    where: { id },
    data: { status: 'DECOMMISSIONED' },
  })
}

export async function addPhotos(id: string, files: Express.Multer.File[]) {
  const equipment = await prisma.equipment.findUnique({ where: { id } })
  if (!equipment) throw new Error('Veículo não encontrado')

  const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY

  let urls: string[]

  if (useCloudinary) {
    urls = await Promise.all(
      files.map(file => uploadImage(file.buffer, `${id}-${Date.now()}-${file.originalname}`))
    )
  } else {
    urls = files.map(file => `${process.env.API_URL || 'http://localhost:3001'}/uploads/${file.filename}`)
  }

  return prisma.equipment.update({
    where: { id },
    data: { photos: { push: urls } },
  })
}

export async function removePhoto(id: string, photoUrl: string) {
  const equipment = await getById(id)
  const updatedPhotos = equipment.photos.filter((p: string) => p !== photoUrl)

  if (process.env.CLOUDINARY_CLOUD_NAME && photoUrl.includes('cloudinary')) {
    await deleteImage(photoUrl)
  }

  return prisma.equipment.update({
    where: { id },
    data: { photos: updatedPhotos },
  })
}

export async function generateAndSaveQRCode(id: string) {
  const baseUrl = process.env.QR_CODE_BASE_URL || 'http://localhost:3000/equipment/public'
  const qrCode = await generateQRCode(`${baseUrl}/${id}`)
  return prisma.equipment.update({
    where: { id },
    data: { qrCode },
  })
}

export async function getPublic(id: string) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    select: {
      id: true, name: true, category: true, brand: true,
      model: true, year: true, status: true, dailyRate: true, photos: true,
    },
  })
  if (!equipment) throw new Error('Veículo não encontrado')
  return equipment
}
