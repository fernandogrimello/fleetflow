'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import { Rental } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    rentalId: '',
    checkinDate: new Date().toISOString().slice(0, 16),
    condition: 'good',
    checkinNotes: '',
  })

  useEffect(() => {
    api.get('/rentals').then(({ data }) => {
      const active = (data.items || data).filter((r: Rental) => !r.checkinDate)
      setRentals(active)
      if (active.length > 0) setForm(prev => ({ ...prev, rentalId: active[0].id }))
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post(\`/rentals/\${form.rentalId}/checkin\`, {
        checkinDate: new Date(form.checkinDate).toISOString(),
        condition: form.condition,
        checkinNotes: form.checkinNotes || undefined,
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao registrar devolução')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border text-white outline-none focus:border-blue-500 transition-colors"
  const inputStyle = { backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }
  const labelClass = "block text-sm font-medium text-slate-300 mb-2"

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 border-b" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Check-out</h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Devolução pelo Cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto">
        <div>
          <label className={labelClass}>Locação Ativa</label>
          <select name="rentalId" value={form.rentalId} onChange={handleChange} required className={inputClass} style={inputStyle}>
            <option value="">Selecione uma locação...</option>
            {rentals.map(r => (
              <option key={r.id} value={r.id}>
                {(r as any).equipment?.name || r.equipmentId} — {(r as any).client?.name || r.clientId}
              </option>
            ))}
          </select>
          {rentals.length === 0 && (
            <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>Nenhuma locação ativa no momento</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Data e Hora da Devolução</label>
          <input type="datetime-local" name="checkinDate" value={form.checkinDate} onChange={handleChange} required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Condição do Veículo</label>
          <select name="condition" value={form.condition} onChange={handleChange} className={inputClass} style={inputStyle}>
            <option value="good">Bom estado</option>
            <option value="damaged">Danificado - requer manutenção</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Descrição das Condições (opcional)</label>
          <textarea name="checkinNotes" value={form.checkinNotes} onChange={handleChange} rows={4}
            placeholder="Descrição das condições, avarias encontradas..."
            className={inputClass} style={{ ...inputStyle, resize: 'none' }} />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#450a0a', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2 pb-8">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: '#1e293b', color: 'var(--muted)' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading || rentals.length === 0}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#3b82f6' }}>
            {loading ? 'Registrando...' : 'Confirmar Devolução'}
          </button>
        </div>
      </form>
    </div>
  )
}
