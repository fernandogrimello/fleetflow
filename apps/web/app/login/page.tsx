'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setToken(data.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-1">FleetFlow</h1>
          <p style={{ color: 'var(--muted)' }}>Gestão de frota de veículos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border text-white outline-none focus:border-blue-500 transition-colors"
              style={{ backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border text-white outline-none focus:border-blue-500 transition-colors"
              style={{ backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }}
              placeholder="••••••"
              required
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#450a0a', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: loading ? 'var(--muted)' : 'var(--primary)' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
