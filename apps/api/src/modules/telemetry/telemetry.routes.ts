import { Router } from 'express'
import * as telemetryController from './telemetry.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.get('/fleet-map', authMiddleware, telemetryController.getFleetMap)
router.get('/:equipmentId/location', authMiddleware, telemetryController.getLastLocation)
router.post('/:equipmentId/location', authMiddleware, telemetryController.updateLocation)

export default router
