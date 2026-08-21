'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export default function MaintenancePage() {
  const [equipments, setEquipments] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')
  const [maintenances, setMaintenances] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/equipment').then(({ data }) => {
      setEquipments(data.items)
      if (data.items.length > 0) setSelected(data.items[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoading(true)
    api.get(`/maintenance/equipment/${selected}`)
      .then(({ data }) => setMaintenances(data))
      .finally(() => setLoading(false))
  }, [selected])

  const totalCost = (m: any) => {
    const labor = Number(m.laborCost || 0)
    const parts = (m.parts || []).reduce((s: number, p: any) => s + p.quantity * Number(p.unitPrice), 0)
    return labor + parts
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manutencao</h1>
        <p style={{ color: 'var(--muted)' }}>Historico de manutencoes por equipamento</p>
      </div>

      {/* Equipment selector */}
      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <label className="block text-sm font-medium text-slate-300 mb-2">Selecionar Equipamento</label>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 rounded-lg border text-white outline-none"
          style={{ backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }}
        >
          {equipments.map(e => (
            <option key={e.id} value={e.id}>{e.name} — {e.brand} {e.model}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--card)' }} />
          ))}
        </div>
      ) : maintenances.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <div className="text-5xl mb-4">🔧</div>
          <div className="text-lg font-medium text-white mb-1">Nenhuma manutencao registrada</div>
        </div>
      ) : (
        <div className="space-y-4">
          {maintenances.map((m: any) => {
            const done = !!m.releaseDate
            const hasOS = !!m.executedDate
            const cost = totalCost(m)

            return (
              <div key={m.id} className="p-5 rounded-xl border"
                style={{ backgroundColor: 'var(--card)', borderColor: done ? 'var(--card-border)' : '#f59e0b' }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {done
                      ? <CheckCircle size={16} style={{ color: '#22c55e' }} />
                      : <Clock size={16} style={{ color: '#f59e0b' }} />
                    }
                    <span className="text-white font-medium text-sm">{m.description}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: m.type === 'PREVENTIVE' ? '#172554' : '#450a0a', color: m.type === 'PREVENTIVE' ? '#3b82f6' : '#ef4444' }}>
                      {m.type === 'PREVENTIVE' ? 'Preventiva' : 'Corretiva'}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ backgroundColor: done ? '#052e16' : '#451a03', color: done ? '#22c55e' : '#f59e0b' }}>
                    {done ? 'Concluida' : hasOS ? 'Em execucao' : 'Agendada'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                  <div>
                    <div className="mb-0.5">Agendamento</div>
                    <div className="text-white">{new Date(m.scheduledDate).toLocaleDateString('pt-BR')}</div>
                  </div>
                  {m.technicianName && (
                    <div>
                      <div className="mb-0.5">Tecnico</div>
                      <div className="text-white">{m.technicianName}</div>
                    </div>
                  )}
                  {m.releaseDate && (
                    <div>
                      <div className="mb-0.5">Liberacao</div>
                      <div className="text-white">{new Date(m.releaseDate).toLocaleDateString('pt-BR')}</div>
                    </div>
                  )}
                  {cost > 0 && (
                    <div>
                      <div className="mb-0.5">Custo Total</div>
                      <div className="font-medium" style={{ color: '#ef4444' }}>
                        R$ {cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                </div>

                {m.parts?.length > 0 && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Pecas utilizadas:</div>
                    <div className="flex flex-wrap gap-2">
                      {m.parts.map((p: any) => (
                        <span key={p.id} className="text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: '#0f172a', color: 'var(--muted)' }}>
                          {p.name} x{p.quantity} (R$ {Number(p.unitPrice).toLocaleString('pt-BR')})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
