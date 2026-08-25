import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'

let adminToken: string
let equipmentId: string
let maintenanceId: string

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: 'maintenance-admin@test.com' } })

  const reg = await request(app).post('/auth/register')
    .send({ name: 'Maintenance Admin', email: 'maintenance-admin@test.com', password: '123456', role: 'ADMIN' })
  adminToken = reg.body.token

  const eq = await prisma.equipment.create({
    data: {
      name: 'Veiculo Teste Manutencao',
      category: 'Van',
      brand: 'Test',
      model: 'Test Van',
      year: 2022,
      serialNumber: `TEST-MAINT-${Date.now()}`,
      dailyRate: 250,
      purchasePrice: 150000,
      status: 'AVAILABLE',
    }
  })
  equipmentId = eq.id
})

afterAll(async () => {
  await prisma.maintenancePart.deleteMany({ where: { maintenance: { equipmentId } } }).catch(() => null)
  await prisma.maintenance.deleteMany({ where: { equipmentId } }).catch(() => null)
  await prisma.equipment.delete({ where: { id: equipmentId } }).catch(() => null)
  await prisma.user.deleteMany({ where: { email: 'maintenance-admin@test.com' } })
  await prisma.$disconnect()
})

describe('Maintenance', () => {
  it('deve agendar manutencao preventiva', async () => {
    const res = await request(app)
      .post('/maintenance')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        equipmentId,
        type: 'PREVENTIVE',
        description: 'Troca de oleo e filtros',
        scheduledDate: new Date().toISOString(),
        technicianName: 'Carlos Silva',
        laborCost: 300,
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.type).toBe('PREVENTIVE')
    maintenanceId = res.body.id
  })

  it('deve listar manutencoes do veiculo', async () => {
    const res = await request(app)
      .get(`/maintenance/equipment/${equipmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('deve rejeitar manutencao sem token', async () => {
    const res = await request(app)
      .post('/maintenance')
      .send({ equipmentId, type: 'PREVENTIVE', description: 'Teste' })

    expect(res.status).toBe(401)
  })

  it('deve liberar OS de manutencao', async () => {
    const res = await request(app)
      .put(`/maintenance/${maintenanceId}/release`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        releaseNotes: 'Manutencao concluida com sucesso',
        technicianName: 'Carlos Silva',
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('releaseDate')
    expect(res.body.releaseNotes).toBe('Manutencao concluida com sucesso')
  })

  it('deve buscar manutencao por id', async () => {
    const res = await request(app)
      .get(`/maintenance/${maintenanceId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(maintenanceId)
  })
})
