'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Modal from './Modal'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function MaintenanceModal({ onClose, onSuccess }: Props) {
  const [equipments, setEquipments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    equipmentId: '',
    type: 'PREVENTIVE',
    description: '',
    scheduledDate: new Date().toISOString().slice(0, 16),
  })

  useEffect(() => {
    api.get('/equipment?limit=100').then(({ data }) => {
      const available = data.items.filter((e: any) => e.status === 'AVAILABLE' || e.status === 'MAINTENANCE')
      setEquipments(available)
      if (available.length > 0) setForm(prev => ({ ...prev, equipmentId: available[0].id }))
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
      await api.post('/maintenance', {
        ...form,
        scheduledDate: new Date(form.scheduledDate).toISOString(),
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao agendar manutenção')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg border text-white outline-none focus:border-blue-500 transition-colors"
  const inputStyle = { backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }
  const labelClass = "block text-sm font-medium text-slate-300 mb-1"

  return (
    <Modal title="Agendar Manutenção" onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Equipamento</label>
          <select name="equipmentId" value={form.equipmentId} onChange={handleChange} required className={inputClass} style={inputStyle}>
            <option value="">Selecione um equipamento...</option>
            {equipments.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.brand} {e.model} ({e.status === 'AVAILABLE' ? 'Disponível' : 'Em Manutenção'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Tipo de Manutenção</label>
          <select name="type" value={form.type} onChange={handleChange} required className={inputClass} style={inputStyle}>
            <option value="PREVENTIVE">Preventiva — revisão programada</option>
            <option value="CORRECTIVE">Corretiva — reparo de avaria</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Descrição</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} required
            placeholder="Ex: Troca de óleo e filtros — revisão dos 2000h"
            className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Data Prevista</label>
          <input type="datetime-local" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} required className={inputClass} style={inputStyle} />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#450a0a', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#1e293b', color: 'var(--muted)' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#f59e0b' }}>
            {loading ? 'Agendando...' : 'Agendar Manutenção'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
