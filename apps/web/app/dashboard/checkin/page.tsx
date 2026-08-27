'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft } from 'lucide-react'

export default function CheckinPage() {
  const router = useRouter()
  const [equipments, setEquipments] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    equipmentId: '',
    clientId: '',
    checkoutDate: new Date().toISOString().slice(0, 16),
    checkoutNotes: '',
  })

  useEffect(() => {
    api.get('/equipment?status=AVAILABLE&limit=100').then(({ data }) => setEquipments(data.items))
    api.get('/clients').then(({ data }) => setClients(data.items)).catch(() => setClients([]))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/rentals/checkout', {
        equipmentId: form.equipmentId,
        clientId: form.clientId,
        checkoutDate: new Date(form.checkoutDate).toISOString(),
        checkoutNotes: form.checkoutNotes || undefined,
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao registrar retirada')
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
          <h1 className="text-lg font-bold text-white">Check-in</h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Retirada pelo Cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto">
        <div>
          <label className={labelClass}>Veículo Disponível</label>
          <select name="equipmentId" value={form.equipmentId} onChange={handleChange} required className={inputClass} style={inputStyle}>
            <option value="">Selecione um veículo...</option>
            {equipments.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.brand} {e.model} (R$ {Number(e.dailyRate).toLocaleString('pt-BR')}/dia)
              </option>
            ))}
          </select>
          {equipments.length === 0 && (
            <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>Nenhum veículo disponível no momento</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Cliente</label>
          <select name="clientId" value={form.clientId} onChange={handleChange} required className={inputClass} style={inputStyle}>
            <option value="">Selecione um cliente...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Data e Hora da Retirada</label>
          <input type="datetime-local" name="checkoutDate" value={form.checkoutDate} onChange={handleChange} required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Observações (opcional)</label>
          <textarea name="checkoutNotes" value={form.checkoutNotes} onChange={handleChange} rows={4}
            placeholder="Estado do veículo, condições especiais..."
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
          <button type="submit" disabled={loading || equipments.length === 0}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#22c55e' }}>
            {loading ? 'Registrando...' : 'Confirmar Retirada'}
          </button>
        </div>
      </form>
    </div>
  )
}
