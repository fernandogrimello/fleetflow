import { Response } from 'express'
import * as financialService from './financial.service'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { handleError } from '../../utils/handle-error'

export async function getEquipmentROI(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await financialService.getEquipmentROI(req.params.equipmentId)
    res.json(result)
  } catch (error) {
    handleError(error, res, 404)
  }
}
