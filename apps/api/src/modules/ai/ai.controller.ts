import { Request, Response } from 'express'
import * as aiService from './ai.service'
import { handleError } from '../../utils/handle-error'

export async function predictNextMaintenance(req: Request, res: Response): Promise<void> {
  try {
    const result = await aiService.predictNextMaintenance(req.params.equipmentId)
    res.json(result)
  } catch (error) {
    handleError(error, res, 500)
  }
}

export async function analyzeFleet(req: Request, res: Response): Promise<void> {
  try {
    const result = await aiService.analyzeFleet()
    res.json(result)
  } catch (error) {
    handleError(error, res, 500)
  }
}
