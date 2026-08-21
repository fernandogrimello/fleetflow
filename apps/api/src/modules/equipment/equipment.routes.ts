import { Router } from 'express'
import * as equipmentController from './equipment.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', equipmentController.list)
router.post('/', equipmentController.create)
router.get('/:id', equipmentController.getById)
router.put('/:id', equipmentController.update)
router.delete('/:id', equipmentController.decommission)

export default router
