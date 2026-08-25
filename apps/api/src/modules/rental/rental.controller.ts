import { Response } from 'express'
import { z } from 'zod'
import * as rentalService from './rental.service'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { handleError } from '../../utils/handle-error'

const checkoutSchema = z.object({
  equipmentId: z.string().uuid(),
  clientId: z.string().uuid(),
  checkoutDate: z.string(),
  checkoutNotes: z.string().optional(),
  dailyRate: z.number().positive(),
})

const checkinSchema = z.object({
  checkinCondition: z.enum(['GREAT', 'GOOD', 'BAD', 'DAMAGED']),
  checkinNotes: z.string().optional(),
})

export async function checkout(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = checkoutSchema.parse(req.body)
    const rental = await rentalService.checkout(data, req.userId!)
    res.status(201).json(rental)
  } catch (error) {
    handleError(error, res)
  }
}

export async function checkin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = checkinSchema.parse(req.body)
    const rental = await rentalService.checkin(req.params.id as string, data, req.userId!)
    res.json(rental)
  } catch (error) {
    handleError(error, res)
  }
}

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const rentals = await rentalService.list()
    res.json(rentals)
  } catch (error) {
    handleError(error, res, 500)
  }
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const rental = await rentalService.getById(req.params.id as string)
    res.json(rental)
  } catch (error) {
    handleError(error, res, 404)
  }
}
