import { Router } from 'express'
import * as financialController from './financial.controller'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/equipment/:equipmentId', financialController.getEquipmentROI)

export default router
