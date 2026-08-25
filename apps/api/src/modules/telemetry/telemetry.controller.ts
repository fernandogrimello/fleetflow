import { Request, Response } from 'express'
import { z } from 'zod'
import * as telemetryService from './telemetry.service'
import { handleError } from '../../utils/handle-error'

const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  odometer: z.number().min(0),
  source: z.string().optional(),
})

export async function updateLocation(req: Request, res: Response): Promise<void> {
  try {
    const data = updateLocationSchema.parse(req.body)
    const result = await telemetryService.updateLocation(req.params.equipmentId as string, data)
    res.json(result)
  } catch (error) {
    handleError(error, res)
  }
}

export async function getLastLocation(req: Request, res: Response): Promise<void> {
  try {
    const result = await telemetryService.getLastLocation(req.params.equipmentId as string)
    res.json(result)
  } catch (error) {
    handleError(error, res, 404)
  }
}

export async function getFleetMap(req: Request, res: Response): Promise<void> {
  try {
    const result = await telemetryService.getFleetMap()
    res.json(result)
  } catch (error) {
    handleError(error, res, 500)
  }
}
