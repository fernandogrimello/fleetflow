import { Request, Response } from 'express'
import { z } from 'zod'
import * as authService from './auth.service'
import { AuthRequest } from '../../middlewares/auth.middleware'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
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
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message })
      return
    }
    if (error instanceof Error) {
      res.status(400).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const data = loginSchema.parse(req.body)
    const result = await authService.login(data)
    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message })
      return
    }
    if (error instanceof Error) {
      res.status(401).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await authService.me(req.userId!)
    res.json(user)
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message })
      return
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
