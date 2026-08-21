'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Modal from './Modal'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function CheckoutModal({ onClose, onSuccess }: Props) {
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
        ...form,
        checkoutDate: new Date(form.checkoutDate).toISOString(),
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao realizar checkout')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border text-white outline-none focus:border-blue-500 transition-colors"
  const inputStyle = { backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }
  const labelClass = "block text-sm font-medium text-slate-300 mb-1"

  return (
    <Modal title="Check-out de Equipamento" onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Equipamento Disponivel</label>
          <select name="equipmentId" value={form.equipmentId} onChange={handleChange} required className={inputClass} style={inputStyle}>
            <option value="">Selecione um equipamento...</option>
            {equipments.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.brand} {e.model} (R$ {Number(e.dailyRate).toLocaleString('pt-BR')}/dia)
              </option>
            ))}
          </select>
          {equipments.length === 0 && (
            <p className="text-xs mt-1" style={{ color: 'var(--warning)' }}>Nenhum equipamento disponivel no momento</p>
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
          <label className={labelClass}>Data e Hora do Check-out</label>
          <input type="datetime-local" name="checkoutDate" value={form.checkoutDate} onChange={handleChange} required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Observacoes (opcional)</label>
          <textarea name="checkoutNotes" value={form.checkoutNotes} onChange={handleChange} rows={3}
            placeholder="Estado do equipamento, condicoes especiais..."
            className={inputClass} style={inputStyle} />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#450a0a', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: '#1e293b', color: 'var(--muted)' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading || equipments.length === 0}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}>
            {loading ? 'Processando...' : 'Confirmar Check-out'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
