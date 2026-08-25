import { Request, Response } from 'express'
import { z } from 'zod'
import * as authService from './auth.service'
import { AuthRequest } from '../../middlewares/auth.middleware'
import { handleError } from '../../utils/handle-error'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  role: z.enum(['ADMIN', 'CLIENT']).optional(),
})

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Senha obrigatoria'),
})

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const data = registerSchema.parse(req.body)
    const result = await authService.register(data)
    res.status(201).json(result)
  } catch (error) {
    handleError(error, res)
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const data = loginSchema.parse(req.body)
    const result = await authService.login(data)
    res.json(result)
  } catch (error) {
    handleError(error, res, 401)
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await authService.me(req.userId!)
    res.json(user)
  } catch (error) {
    handleError(error, res, 404)
  }
}
