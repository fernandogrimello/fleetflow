import { Router } from 'express'
import * as insuranceController from './insurance.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/expiring', insuranceController.getExpiringPolicies)
router.get('/:equipmentId', insuranceController.getByEquipment)
router.post('/', insuranceController.create)
router.put('/:id', insuranceController.renewInsurance)
router.post('/:insuranceId/claims', insuranceController.createClaim)

export default router
