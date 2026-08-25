import request from 'supertest'
import app from '../app'
import { prisma } from '../lib/prisma'

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: 'test@fleetflow.com' } })
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: 'test@fleetflow.com' } })
  await prisma.$disconnect()
})

describe('Auth', () => {
  describe('POST /auth/register', () => {
    it('deve registrar um novo usuario', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@fleetflow.com', password: '123456' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user.email).toBe('test@fleetflow.com')
      expect(res.body.user.role).toBe('ADMIN')
    })

    it('deve rejeitar email duplicado', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'test@fleetflow.com', password: '123456' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
    })

    it('deve rejeitar senha curta', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test User', email: 'outro@fleetflow.com', password: '123' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais validas', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@fleetflow.com', password: '123456' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.user).toHaveProperty('role')
    })

    it('deve rejeitar senha incorreta', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@fleetflow.com', password: 'errada' })

      expect(res.status).toBe(401)
    })

    it('deve rejeitar email inexistente', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'naoexiste@fleetflow.com', password: '123456' })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /auth/me', () => {
    it('deve retornar dados do usuario autenticado', async () => {
      const login = await request(app)
        .post('/auth/login')
        .send({ email: 'test@fleetflow.com', password: '123456' })

      const token = login.body.token

      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.email).toBe('test@fleetflow.com')
    })

    it('deve rejeitar requisicao sem token', async () => {
      const res = await request(app).get('/auth/me')
      expect(res.status).toBe(401)
    })
  })
})
