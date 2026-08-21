import { Response } from 'express'
import * as metricsService from './metrics.service'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { handleError } from '../../utils/handle-error'

export async function getRanking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await metricsService.getRanking()
    res.json(result)
  } catch (error) {
    handleError(error, res, 500)
  }
}

export async function getOccupancy(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await metricsService.getOccupancy()
    res.json(result)
  } catch (error) {
    handleError(error, res, 500)
  }
}

export async function getMaintenanceCost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await metricsService.getMaintenanceCostByCategory()
    res.json(result)
  } catch (error) {
    handleError(error, res, 500)
  }
}

export async function getROIRanking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await metricsService.getROIRanking()
    res.json(result)
  } catch (error) {
    handleError(error, res, 500)
  }
}
