import { Router } from 'express'
import * as financialController from './financial.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/equipment/:equipmentId', financialController.getEquipmentROI)

export default router
