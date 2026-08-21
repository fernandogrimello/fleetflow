import { Response } from 'express'
import { z } from 'zod'
import * as equipmentService from './equipment.service'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { EquipmentStatus } from '@prisma/client'

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
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message })
      return
    }
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
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
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const equipment = await equipmentService.getById(req.params.id)
    res.json(equipment)
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = updateSchema.parse(req.body)
    const equipment = await equipmentService.update(req.params.id, data)
    res.json(equipment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message })
      return
    }
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function decommission(req: AuthRequest, res: Response): Promise<void> {
  try {
    const equipment = await equipmentService.decommission(req.params.id)
    res.json(equipment)
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
