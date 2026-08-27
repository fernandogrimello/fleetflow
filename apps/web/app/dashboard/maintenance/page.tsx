'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Wrench, CheckCircle, Clock, AlertTriangle, Plus, X } from 'lucide-react'

export default function MaintenancePage() {
  const [equipments, setEquipments] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')
  const [maintenances, setMaintenances] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showRelease, setShowRelease] = useState<string | null>(null)
  const [releaseForm, setReleaseForm] = useState({ releaseNotes: '', technicianName: '' })
  const [submitting, setSubmitting] = useState(false)

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

  async function handleRelease(maintenanceId: string) {
    setSubmitting(true)
    try {
      await api.put(`/maintenance/${maintenanceId}/release`, {
        releaseNotes: releaseForm.releaseNotes || 'Liberado após manutencao',
      })
      setShowRelease(null)
      setReleaseForm({ releaseNotes: '', technicianName: '' })
      const { data } = await api.get(`/maintenance/equipment/${selected}`)
      setMaintenances(data)
    } catch (err) {
      alert('Erro ao liberar OS')
    } finally {
      setSubmitting(false)
    }
  }

  const totalCost = (m: any) => {
    const labor = Number(m.laborCost || 0)
    const parts = (m.parts || []).reduce((s: number, p: any) => s + p.quantity * Number(p.unitPrice), 0)
    return labor + parts
  }

  const pending = maintenances.filter(m => !m.releaseDate)
  const done = maintenances.filter(m => m.releaseDate)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Manutenção</h1>
        <p style={{ color: 'var(--muted)' }}>Ordens de serviço por veículo</p>
      </div>

      <div>
        <label className="text-sm font-medium text-white mb-2 block">Veículo</label>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          className="px-4 py-2.5 rounded-lg border text-white outline-none"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          {equipments.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-white">Carregando...</div>
      ) : (
        <div className="space-y-6">
          {/* Pendentes */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                <Clock size={16} /> Em andamento ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(m => (
                  <div key={m.id} className="p-5 rounded-xl border"
                    style={{ backgroundColor: 'var(--card)', borderColor: '#f59e0b44' }}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: m.type === 'PREVENTIVE' ? '#172554' : '#450a0a',
                                     color: m.type === 'PREVENTIVE' ? '#3b82f6' : '#ef4444' }}>
                            {m.type === 'PREVENTIVE' ? 'Preventiva' : 'Corretiva'}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>
                            {new Date(m.scheduledDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-white font-medium">{m.description}</p>
                        {m.technicianName && (
                          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                            Técnico: {m.technicianName}
                          </p>
                        )}
                        {m.parts?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {m.parts.map((p: any) => (
                              <div key={p.id} className="text-xs flex justify-between"
                                style={{ color: 'var(--muted)' }}>
                                <span>{p.name} x{p.quantity}</span>
                                <span>R$ {(p.quantity * Number(p.unitPrice)).toLocaleString('pt-BR')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {totalCost(m) > 0 && (
                          <p className="text-sm font-medium mt-2" style={{ color: '#f59e0b' }}>
                            Total: R$ {totalCost(m).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <button onClick={() => setShowRelease(m.id)}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 py-2 rounded-lg text-sm font-medium text-white mt-3 sm:mt-0"
                        style={{ backgroundColor: '#22c55e' }}>
                        <CheckCircle size={16} />
                        Liberar OS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concluídas */}
          {done.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#22c55e' }}>
                <CheckCircle size={16} /> Concluídas ({done.length})
              </h2>
              <div className="space-y-3">
                {done.map(m => (
                  <div key={m.id} className="p-5 rounded-xl border"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: m.type === 'PREVENTIVE' ? '#172554' : '#450a0a',
                                 color: m.type === 'PREVENTIVE' ? '#3b82f6' : '#ef4444' }}>
                        {m.type === 'PREVENTIVE' ? 'Preventiva' : 'Corretiva'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>
                        Liberado em {new Date(m.releaseDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-white">{m.description}</p>
                    {m.releaseNotes && (
                      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{m.releaseNotes}</p>
                    )}
                    {totalCost(m) > 0 && (
                      <p className="text-sm font-medium mt-2" style={{ color: 'var(--muted)' }}>
                        Custo total: R$ {totalCost(m).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {maintenances.length === 0 && (
            <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
              <Wrench size={40} className="mx-auto mb-3 opacity-30" />
              <p>Nenhuma OS registrada para este veículo</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de liberacao */}
      {showRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: 'var(--card)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Liberar Ordem de Servico</h2>
              <button onClick={() => setShowRelease(null)} style={{ color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Técnico responsável</label>
                <input
                  value={releaseForm.technicianName ?? ''}
                  onChange={e => setReleaseForm(prev => ({ releaseNotes: prev.releaseNotes, technicianName: e.target.value }))}
                  placeholder="Nome do tecnico que realizou o serviço"
                  className="w-full px-4 py-3 rounded-xl text-white outline-none"
                  style={{ backgroundColor: '#0f172a', border: '1px solid var(--card-border)' }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Observações de liberacao</label>
                <textarea
                  value={releaseForm.releaseNotes}
                  onChange={e => setReleaseForm(prev => ({ ...prev, releaseNotes: e.target.value }))}
                  placeholder="Descreva o serviço realizado e condicoes de liberacao..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none resize-none"
                  style={{ backgroundColor: '#0f172a', border: '1px solid var(--card-border)' }}
                />
              </div>
              <button onClick={() => handleRelease(showRelease)} disabled={submitting}
                className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: '#22c55e' }}>
                {submitting ? 'Liberando...' : 'Confirmar Liberação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
