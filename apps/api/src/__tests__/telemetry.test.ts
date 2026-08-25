import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'

let adminToken: string
const equipmentId = 'e1000001-0000-0000-0000-000000000001'

beforeAll(async () => {
  const login = await request(app)
    .post('/auth/login')
    .send({ email: 'luizfernandogrimello@hotmail.com', password: '123456' })
  adminToken = login.body.token
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Telemetria', () => {
  describe('POST /telemetry/:equipmentId/location', () => {
    it('deve registrar localizacao do veiculo', async () => {
      const res = await request(app)
        .post(`/telemetry/${equipmentId}/location`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ latitude: -15.7942, longitude: -47.8825, odometer: 5000 })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('location')
      expect(res.body.location.latitude).toBe(-15.7942)
      expect(res.body).toHaveProperty('currentOdometer')
    })

    it('deve rejeitar coordenadas invalidas', async () => {
      const res = await request(app)
        .post(`/telemetry/${equipmentId}/location`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ latitude: 999, longitude: -47.8825, odometer: 5000 })

      expect(res.status).toBe(400)
    })

    it('deve rejeitar requisicao sem token', async () => {
      const res = await request(app)
        .post(`/telemetry/${equipmentId}/location`)
        .send({ latitude: -15.7942, longitude: -47.8825, odometer: 5000 })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /telemetry/:equipmentId/location', () => {
    it('deve retornar ultima localizacao do veiculo', async () => {
      const res = await request(app)
        .get(`/telemetry/${equipmentId}/location`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('latitude')
      expect(res.body).toHaveProperty('longitude')
    })
  })

  describe('GET /telemetry/fleet-map', () => {
    it('deve retornar mapa da frota com localizacoes', async () => {
      const res = await request(app)
        .get('/telemetry/fleet-map')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBeGreaterThan(0)
      expect(res.body[0]).toHaveProperty('lastLocation')
    })
  })
})
