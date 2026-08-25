import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma'
import { UserRole } from '@prisma/client'

interface RegisterInput {
  name: string
  email: string
  password: string
  role?: UserRole
}

interface LoginInput {
  email: string
  password: string
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw new Error('Email ja cadastrado')

  const hashedPassword = await bcrypt.hash(input.password, 10)

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role || 'ADMIN',
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' } as any
  )

  return { user, token }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) throw new Error('Email ou senha invalidos')

  const validPassword = await bcrypt.compare(input.password, user.password)
  if (!validPassword) throw new Error('Email ou senha invalidos')

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' } as any
  )

  const { password: _, ...userWithoutPassword } = user
  return { user: userWithoutPassword, token }
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  if (!user) throw new Error('Usuario nao encontrado')
  return user
}
