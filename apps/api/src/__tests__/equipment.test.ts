import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'

let adminToken: string
let clientToken: string
let equipmentId: string

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: { in: ['admin@test.com', 'client@test.com'] } } })

  const admin = await request(app).post('/auth/register')
    .send({ name: 'Admin Test', email: 'admin@test.com', password: '123456', role: 'ADMIN' })
  adminToken = admin.body.token

  await request(app).post('/auth/register')
    .send({ name: 'Client Test', email: 'client@test.com', password: '123456' })

  await prisma.user.update({ where: { email: 'client@test.com' }, data: { role: 'CLIENT' } })

  const clientLogin = await request(app).post('/auth/login')
    .send({ email: 'client@test.com', password: '123456' })
  clientToken = clientLogin.body.token
})

afterAll(async () => {
  if (equipmentId) {
    await prisma.equipment.delete({ where: { id: equipmentId } }).catch(() => null)
  }
  await prisma.user.deleteMany({ where: { email: { in: ['admin@test.com', 'client@test.com'] } } })
  await prisma.$disconnect()
})

describe('Equipment', () => {
  describe('POST /equipment', () => {
    it('deve cadastrar veiculo como admin', async () => {
      const res = await request(app)
        .post('/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Pickup',
          category: 'Pickup',
          brand: 'Toyota',
          model: 'Hilux Test',
          year: 2023,
          serialNumber: `TEST-${Date.now()}`,
          dailyRate: 350,
          purchasePrice: 200000,
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(res.body.name).toBe('Test Pickup')
      equipmentId = res.body.id
    })

    it('deve rejeitar cadastro sem token', async () => {
      const res = await request(app).post('/equipment').send({ name: 'Veiculo' })
      expect(res.status).toBe(401)
    })
  })

  describe('GET /equipment', () => {
    it('deve listar veiculos como admin', async () => {
      const res = await request(app)
        .get('/equipment')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('items')
      expect(Array.isArray(res.body.items)).toBe(true)
    })

    it('deve listar veiculos como client', async () => {
      const res = await request(app)
        .get('/equipment')
        .set('Authorization', `Bearer ${clientToken}`)

      expect(res.status).toBe(200)
    })
  })

  describe('RBAC — rotas protegidas', () => {
    it('CLIENT nao pode acessar financeiro', async () => {
      const res = await request(app)
        .get(`/financial/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${clientToken}`)

      expect(res.status).toBe(403)
      expect(res.body.error).toContain('administradores')
    })

    it('ADMIN pode acessar financeiro', async () => {
      const res = await request(app)
        .get(`/financial/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
    })

    it('CLIENT nao pode acessar metricas', async () => {
      const res = await request(app)
        .get('/metrics/ranking')
        .set('Authorization', `Bearer ${clientToken}`)

      expect(res.status).toBe(403)
    })

    it('CLIENT nao pode acessar telemetria de frota', async () => {
      const res = await request(app)
        .get('/metrics/occupancy')
        .set('Authorization', `Bearer ${clientToken}`)

      expect(res.status).toBe(403)
    })
  })

  describe('GET /equipment/public/:id', () => {
    it('deve acessar pagina publica sem autenticacao', async () => {
      const res = await request(app).get(`/equipment/public/${equipmentId}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name')
    })
  })
})
