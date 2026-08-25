import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token nao fornecido' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string }
    req.userId = payload.userId
    req.userRole = payload.role
    next()
  } catch {
    res.status(401).json({ error: 'Token invalido ou expirado' })
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'ADMIN') {
    res.status(403).json({ error: 'Acesso restrito a administradores' })
    return
  }
  next()
}
