import { Router } from 'express'
import * as aiController from './ai.controller'
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/fleet-analysis', aiController.analyzeFleet)
router.get('/maintenance-prediction/:equipmentId', aiController.predictNextMaintenance)

export default router
