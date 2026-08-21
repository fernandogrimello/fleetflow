import { Response } from 'express'
import { ZodError } from 'zod'

export function handleError(error: unknown, res: Response, defaultStatus = 400): void {
  if (error instanceof ZodError) {
    const issues = (error as any).issues ?? (error as any).errors ?? []
    const message = issues.length > 0 ? issues[0].message : 'Dados invalidos'
    res.status(400).json({ error: message })
    return
  }
  if (error instanceof Error) {
    res.status(defaultStatus).json({ error: error.message })
    return
  }
  res.status(500).json({ error: 'Erro interno do servidor' })
}
