import { Request, Response } from 'express'
import { z } from 'zod'
import * as clientsService from './clients.service'
import { handleError } from '../../utils/handle-error'

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  document: z.string().optional(),
})

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const clients = await clientsService.list()
    res.json({ items: clients, total: clients.length })
  } catch (error) {
    handleError(error, res, 500)
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = createSchema.parse(req.body)
    const client = await clientsService.create(data)
    res.status(201).json(client)
  } catch (error) {
    handleError(error, res)
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const client = await clientsService.getById(req.params.id as string)
    res.json(client)
  } catch (error) {
    handleError(error, res, 404)
  }
}
