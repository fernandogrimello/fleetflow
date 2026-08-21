import { Router } from 'express'
import * as rentalController from './rental.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', rentalController.list)
router.post('/checkout', rentalController.checkout)
router.get('/:id', rentalController.getById)
router.post('/:id/checkin', rentalController.checkin)

export default router
