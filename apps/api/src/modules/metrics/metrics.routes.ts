import { Router } from 'express'
import * as metricsController from './metrics.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/ranking', metricsController.getRanking)
router.get('/occupancy', metricsController.getOccupancy)
router.get('/maintenance-cost', metricsController.getMaintenanceCost)
router.get('/roi', metricsController.getROIRanking)

export default router
