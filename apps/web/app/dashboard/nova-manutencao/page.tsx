'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft } from 'lucide-react'

export default function MaintenancePage() {
  const router = useRouter()
  const [equipments, setEquipments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    equipmentId: '',
    type: 'PREVENTIVE',
    description: '',
    scheduledDate: new Date().toISOString().slice(0, 16),
    technicianName: '',
    estimatedCost: '',
  })

  useEffect(() => {
    api.get('/equipment?limit=100').then(({ data }) => setEquipments(data.items))
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
        equipmentId: form.equipmentId,
        type: form.type,
        description: form.description,
        scheduledDate: new Date(form.scheduledDate).toISOString(),
        technicianName: form.technicianName || undefined,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
      })
      router.push('/dashboard/maintenance')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao agendar manutenção')
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
          <h1 className="text-lg font-bold text-white">Agendar Manutenção</h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Nova ordem de serviço</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto">
        <div>
          <label className={labelClass}>Veículo</label>
          <select name="equipmentId" value={form.equipmentId} onChange={handleChange} required className={inputClass} style={inputStyle}>
            <option value="">Selecione um veículo...</option>
            {equipments.map(e => (
              <option key={e.id} value={e.id}>{e.name} — {e.brand} {e.model}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Tipo de Manutenção</label>
          <select name="type" value={form.type} onChange={handleChange} className={inputClass} style={inputStyle}>
            <option value="PREVENTIVE">Preventiva — Revisão programada</option>
            <option value="CORRECTIVE">Corretiva — Reparo não planejado</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Descrição</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} required
            placeholder="Ex: troca de óleo e filtros — revisão dos 20.000km"
            className={inputClass} style={{ ...inputStyle, resize: 'none' }} />
        </div>

        <div>
          <label className={labelClass}>Data Agendada</label>
          <input type="datetime-local" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Técnico Responsável (opcional)</label>
          <input type="text" name="technicianName" value={form.technicianName} onChange={handleChange}
            placeholder="Nome do técnico"
            className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Custo Estimado R$ (opcional)</label>
          <input type="number" name="estimatedCost" value={form.estimatedCost} onChange={handleChange}
            placeholder="0,00"
            className={inputClass} style={inputStyle} />
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
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#f59e0b' }}>
            {loading ? 'Agendando...' : 'Agendar Manutenção'}
          </button>
        </div>
      </form>
    </div>
  )
}
