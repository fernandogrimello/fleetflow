import { Response } from 'express'
import { z } from 'zod'
import * as insuranceService from './insurance.service'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { handleError } from '../../utils/handle-error'

const createSchema = z.object({
  equipmentId: z.string().uuid(),
  policyNumber: z.string().min(1),
  insurer: z.string().min(2),
  insuredValue: z.number().positive(),
  premium: z.number().positive(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  coverage: z.string().optional(),
})

const claimSchema = z.object({
  description: z.string().min(5),
  claimDate: z.string().min(1),
  amount: z.number().positive().optional(),
  notes: z.string().optional(),
})

export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = createSchema.parse(req.body)
    const result = await insuranceService.create(data)
    res.status(201).json(result)
  } catch (error) {
    handleError(error, res)
  }
}

export async function getByEquipment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await insuranceService.getByEquipment(req.params.equipmentId as string)
    res.json(result)
  } catch (error) {
    handleError(error, res, 404)
  }
}

export async function createClaim(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = claimSchema.parse(req.body)
    const result = await insuranceService.createClaim(req.params.id as string, data)
    res.status(201).json(result)
  } catch (error) {
    handleError(error, res)
  }
}

export async function getExpiringPolicies(req: AuthRequest, res: Response): Promise<void> {
  try {
    const days = req.query.days ? Number(req.query.days) : 30
    const result = await insuranceService.getExpiringPolicies(days)
    res.json(result)
  } catch (error) {
    handleError(error, res, 500)
  }
}

export async function renewInsurance(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await insuranceService.renewInsurance(req.params.id as string, req.body)
    res.json(result)
  } catch (error) {
    handleError(error, res)
  }
}
