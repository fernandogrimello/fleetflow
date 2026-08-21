import { Router } from 'express'
import * as clientsController from './clients.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', clientsController.list)
router.post('/', clientsController.create)
router.get('/:id', clientsController.getById)

export default router
