import { Router } from 'express'
import * as maintenanceController from './maintenance.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.post('/', maintenanceController.schedule)
router.get('/:id', maintenanceController.getById)
router.put('/:id/service-order', maintenanceController.createServiceOrder)
router.put('/:id/release', maintenanceController.release)
router.get('/equipment/:equipmentId', maintenanceController.listByEquipment)

export default router
