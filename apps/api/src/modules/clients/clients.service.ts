import { prisma } from '../../lib/prisma'

interface CreateClientInput {
  name: string
  email: string
  phone?: string
  document?: string
}

export async function list() {
  return prisma.client.findMany({ orderBy: { name: 'asc' } })
}

export async function create(data: CreateClientInput) {
  const existing = await prisma.client.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('Email ja cadastrado')
  return prisma.client.create({ data })
}

export async function getById(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { rentals: { orderBy: { checkoutDate: 'desc' }, take: 10 } },
  })
  if (!client) throw new Error('Cliente nao encontrado')
  return client
}
