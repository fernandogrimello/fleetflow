import { Router } from 'express'
import * as insuranceController from './insurance.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.post('/', insuranceController.create)
router.get('/expiring', insuranceController.getExpiringPolicies)
router.get('/equipment/:equipmentId', insuranceController.getByEquipment)
router.post('/:id/claim', insuranceController.createClaim)

export default router
