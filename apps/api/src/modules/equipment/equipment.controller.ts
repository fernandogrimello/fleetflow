import { Request, Response } from 'express'
import { z } from 'zod'
import * as equipmentService from './equipment.service'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { EquipmentStatus } from '@prisma/client'
import { handleError } from '../../utils/handle-error'

const createSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  serialNumber: z.string().min(1),
  dailyRate: z.number().positive(),
  purchasePrice: z.number().positive(),
})

const updateSchema = createSchema.partial().extend({
  status: z.nativeEnum(EquipmentStatus).optional(),
})

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = createSchema.parse(req.body)
    const equipment = await equipmentService.create(data)
    res.status(201).json(equipment)
  } catch (error) {
    handleError(error, res)
  }
}

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, category, search, page, limit } = req.query
    const result = await equipmentService.list({
      status: status as EquipmentStatus | undefined,
      category: category as string | undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
    res.json(result)
  } catch (error) {
    handleError(error, res, 500)
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const equipment = await equipmentService.getById(req.params.id as string)
    res.json(equipment)
  } catch (error) {
    handleError(error, res, 404)
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = updateSchema.parse(req.body)
    const equipment = await equipmentService.update(req.params.id as string, data)
    res.json(equipment)
  } catch (error) {
    handleError(error, res)
  }
}

export async function decommission(req: AuthRequest, res: Response): Promise<void> {
  try {
    const equipment = await equipmentService.decommission(req.params.id as string)
    res.json(equipment)
  } catch (error) {
    handleError(error, res)
  }
}

export async function addPhotos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'Nenhuma foto enviada' })
      return
    }
    const filenames = files.map(f => f.filename)
    const equipment = await equipmentService.addPhotos(req.params.id as string, files)
    res.json(equipment)
  } catch (error) {
    handleError(error, res)
  }
}

export async function generateQRCode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await equipmentService.generateAndSaveQRCode(req.params.id as string)
    res.json(result)
  } catch (error) {
    handleError(error, res)
  }
}

export async function getPublic(req: AuthRequest, res: Response): Promise<void> {
  try {
    const equipment = await equipmentService.getPublic(req.params.id as string)
    res.json(equipment)
  } catch (error) {
    handleError(error, res, 404)
  }
}

export async function removePhoto(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { photoUrl } = req.body
    if (!photoUrl) {
      res.status(400).json({ error: 'URL da foto obrigatoria' })
      return
    }
    const equipment = await equipmentService.removePhoto(req.params.id as string, photoUrl)
    res.json(equipment)
  } catch (error) {
    handleError(error, res)
  }
}
