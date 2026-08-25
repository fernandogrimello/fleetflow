import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'

let adminToken: string
let equipmentId: string
let clientId: string
let rentalId: string

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: 'rental-admin@test.com' } })

  const reg = await request(app).post('/auth/register')
    .send({ name: 'Rental Admin', email: 'rental-admin@test.com', password: '123456', role: 'ADMIN' })
  adminToken = reg.body.token

  const client = await prisma.client.create({
    data: { name: 'Cliente Teste Rental', email: `client-rental-${Date.now()}@test.com` }
  })
  clientId = client.id

  const eq = await prisma.equipment.create({
    data: {
      name: 'Veiculo Teste Rental',
      category: 'Pickup',
      brand: 'Test',
      model: 'Test Model',
      year: 2023,
      serialNumber: `TEST-RENTAL-${Date.now()}`,
      dailyRate: 200,
      purchasePrice: 100000,
      status: 'AVAILABLE',
    }
  })
  equipmentId = eq.id
})

afterAll(async () => {
  await prisma.rental.deleteMany({ where: { equipmentId } }).catch(() => null)
  await prisma.equipment.delete({ where: { id: equipmentId } }).catch(() => null)
  await prisma.client.delete({ where: { id: clientId } }).catch(() => null)
  await prisma.user.deleteMany({ where: { email: 'rental-admin@test.com' } })
  await prisma.$disconnect()
})

describe('Rentals', () => {
  it('deve listar locacoes', async () => {
    const res = await request(app)
      .get('/rentals')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('deve rejeitar listagem sem token', async () => {
    const res = await request(app).get('/rentals')
    expect(res.status).toBe(401)
  })

  it('deve realizar checkout de veiculo disponivel', async () => {
    const res = await request(app)
      .post('/rentals/checkout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        equipmentId,
        clientId,
        checkoutDate: new Date().toISOString(),
        dailyRate: 200,
      })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    rentalId = res.body.id
  })

  it('deve rejeitar checkout de veiculo ja alugado', async () => {
    const res = await request(app)
      .post('/rentals/checkout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        equipmentId,
        clientId,
        checkoutDate: new Date().toISOString(),
        dailyRate: 200,
      })
    expect(res.status).toBe(400)
  })

  it('deve realizar checkin da locacao', async () => {
    const res = await request(app)
      .post(`/rentals/${rentalId}/checkin`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ checkinCondition: 'GOOD', checkinNotes: 'Veiculo em boas condicoes' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('checkinDate')
    expect(res.body).toHaveProperty('totalDays')
    expect(res.body).toHaveProperty('totalAmount')
  })
})
