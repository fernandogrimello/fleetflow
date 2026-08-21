import { Router, Request, Response } from 'express'
import * as equipmentController from './equipment.controller'
import { authMiddleware } from '../../middlewares/auth.middleware'
import { upload } from '../../utils/upload'

const router = Router()

router.get('/public/:id', equipmentController.getPublic)

router.use(authMiddleware)

router.get('/', equipmentController.list)
router.post('/', equipmentController.create)
router.get('/:id', equipmentController.getById)
router.put('/:id', equipmentController.update)
router.delete('/:id', equipmentController.decommission)
router.post('/:id/photos', upload.array('photos', 10), equipmentController.addPhotos)
router.post('/:id/qrcode', equipmentController.generateQRCode)

export default router
