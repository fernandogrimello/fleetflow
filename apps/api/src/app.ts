import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import authRoutes from './modules/auth/auth.routes'
import equipmentRoutes from './modules/equipment/equipment.routes'
import rentalRoutes from './modules/rental/rental.routes'
import maintenanceRoutes from './modules/maintenance/maintenance.routes'
import financialRoutes from './modules/financial/financial.routes'
import metricsRoutes from './modules/metrics/metrics.routes'
import insuranceRoutes from './modules/insurance/insurance.routes'

dotenv.config()

const app = express()

app.use(helmet())

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
}))

app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Muitas requisicoes. Tente novamente em breve.' },
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/auth', authRoutes)
app.use('/equipment', equipmentRoutes)
app.use('/rentals', rentalRoutes)
app.use('/maintenance', maintenanceRoutes)
app.use('/financial', financialRoutes)
app.use('/metrics', metricsRoutes)
app.use('/insurance', insuranceRoutes)

export default app
