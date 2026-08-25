'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Modal from './Modal'
import { Rental } from '@/types'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const conditions = [
  { value: 'GREAT', label: 'Otimo — sem avarias' },
  { value: 'GOOD', label: 'Bom — desgaste normal' },
  { value: 'BAD', label: 'Ruim — avarias menores' },
  { value: 'DAMAGED', label: 'Danificado — requer manutenção' },
]

export default function CheckoutModal({ onClose, onSuccess }: Props) {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    rentalId: '',
    checkinDate: new Date().toISOString().slice(0, 16),
    checkinCondition: 'GOOD',
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
      await api.post(`/rentals/${form.rentalId}/checkin`, {
        checkinDate: new Date(form.checkinDate).toISOString(),
        checkinCondition: form.checkinCondition,
        checkinNotes: form.checkinNotes || undefined,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao registrar devolucao')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border text-white outline-none focus:border-blue-500 transition-colors"
  const inputStyle = { backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }
  const labelClass = "block text-sm font-medium text-slate-300 mb-1"

  const selectedRental = rentals.find(r => r.id === form.rentalId)

  return (
    <Modal title="Check-out — Devolução pelo Cliente" onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Veículo em Uso</label>
          <select name="rentalId" value={form.rentalId} onChange={handleChange} required className={inputClass} style={inputStyle}>
            <option value="">Selecione uma locação...</option>
            {rentals.map(r => (
              <option key={r.id} value={r.id}>
                {r.equipment?.name} — {r.client?.name} (desde {new Date(r.checkoutDate).toLocaleDateString('pt-BR')})
              </option>
            ))}
          </select>
          {rentals.length === 0 && (
            <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>Nenhum veículo em uso no momento</p>
          )}
        </div>

        {selectedRental && (
          <div className="p-3 rounded-lg text-xs space-y-1" style={{ backgroundColor: '#0f172a', color: 'var(--muted)' }}>
            <div>Veículo: <span className="text-white">{selectedRental.equipment?.name}</span></div>
            <div>Diária: <span className="text-white">R$ {Number(selectedRental.dailyRate).toLocaleString('pt-BR')}</span></div>
            <div>Retirada: <span className="text-white">{new Date(selectedRental.checkoutDate).toLocaleDateString('pt-BR')}</span></div>
          </div>
        )}

        <div>
          <label className={labelClass}>Data e Hora da Devolução</label>
          <input type="datetime-local" name="checkinDate" value={form.checkinDate} onChange={handleChange} required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Condição do Veículo</label>
          <select name="checkinCondition" value={form.checkinCondition} onChange={handleChange} required className={inputClass} style={inputStyle}>
            {conditions.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {form.checkinCondition === 'DAMAGED' && (
            <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
              Veículo sera marcado como Em Manutenção automaticamente
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Observações (opcional)</label>
          <textarea name="checkinNotes" value={form.checkinNotes} onChange={handleChange} rows={3}
            placeholder="Descrição das condições, avarias encontradas..."
            className={inputClass} style={inputStyle} />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#450a0a', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#1e293b', color: 'var(--muted)' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading || rentals.length === 0}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#3b82f6' }}>
            {loading ? 'Registrando...' : 'Confirmar Devolução'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
