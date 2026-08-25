import { Response } from 'express'
import { z } from 'zod'
import * as maintenanceService from './maintenance.service'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { MaintenanceType } from '@prisma/client'
import { handleError } from '../../utils/handle-error'

const scheduleSchema = z.object({
  equipmentId: z.string().uuid(),
  type: z.nativeEnum(MaintenanceType),
  description: z.string().min(5),
  scheduledDate: z.string().min(1),
})

const serviceOrderSchema = z.object({
  technicianName: z.string().min(2),
  executedDate: z.string().min(1),
  laborCost: z.number().min(0),
  parts: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).default([]),
})

const releaseSchema = z.object({
  releaseNotes: z.string().optional(),
})

export async function schedule(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = scheduleSchema.parse(req.body)
    const result = await maintenanceService.schedule({ ...data, scheduledById: req.userId! })
    res.status(201).json(result)
  } catch (error) {
    handleError(error, res)
  }
}

export async function createServiceOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = serviceOrderSchema.parse(req.body)
    const result = await maintenanceService.createServiceOrder(req.params.id as string, data)
    res.json(result)
  } catch (error) {
    handleError(error, res)
  }
}

export async function release(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = releaseSchema.parse(req.body)
    const result = await maintenanceService.release(req.params.id as string, { ...data, releasedById: req.userId! })
    res.json(result)
  } catch (error) {
    handleError(error, res)
  }
}

export async function listByEquipment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await maintenanceService.listByEquipment(req.params.equipmentId as string)
    res.json(result)
  } catch (error) {
    handleError(error, res, 500)
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await maintenanceService.getById(req.params.id as string)
    res.json(result)
  } catch (error) {
    handleError(error, res, 404)
  }
}
