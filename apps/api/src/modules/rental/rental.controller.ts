import { Response } from 'express'
import { z } from 'zod'
import * as rentalService from './rental.service'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { RentalCondition } from '@prisma/client'
import { handleError } from '../../utils/handle-error'

const checkoutSchema = z.object({
  equipmentId: z.string().uuid(),
  clientId: z.string().uuid(),
  checkoutDate: z.string().min(1, 'Data de checkout obrigatoria'),
  checkoutNotes: z.string().optional(),
})

const checkinSchema = z.object({
  checkinDate: z.string().min(1, 'Data de checkin obrigatoria'),
  checkinCondition: z.nativeEnum(RentalCondition),
  checkinNotes: z.string().optional(),
})

export async function checkout(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = checkoutSchema.parse(req.body)
    const rental = await rentalService.checkout({ ...data, checkedOutById: req.userId! })
    res.status(201).json(rental)
  } catch (error) {
    handleError(error, res)
  }
}

export async function checkin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = checkinSchema.parse(req.body)
    const rental = await rentalService.checkin(req.params.id, { ...data, checkedInById: req.userId! })
    res.json(rental)
  } catch (error) {
    handleError(error, res)
  }
}

export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { clientId, equipmentId, page, limit } = req.query
    const result = await rentalService.list({
      clientId: clientId as string | undefined,
      equipmentId: equipmentId as string | undefined,
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
    const rental = await rentalService.getById(req.params.id)
    res.json(rental)
  } catch (error) {
    handleError(error, res, 404)
  }
}
