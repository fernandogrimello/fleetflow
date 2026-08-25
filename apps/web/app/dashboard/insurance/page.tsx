'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Shield, AlertTriangle, CheckCircle, Plus, X } from 'lucide-react'

export default function InsurancePage() {
  const [expiring, setExpiring] = useState<any[]>([])
  const [equipments, setEquipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showRenew, setShowRenew] = useState<any>(null)
  const [renewForm, setRenewForm] = useState({ policyNumber: '', premium: '', startDate: '', endDate: '' })
  const [renewing, setRenewing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    equipmentId: '',
    policyNumber: '',
    insurer: '',
    insuredValue: '',
    premium: '',
    startDate: '',
    endDate: '',
    coverage: '',
  })

  async function fetchData() {
    try {
      const [exp, eq] = await Promise.all([
        api.get('/insurance/expiring?days=365'),
        api.get('/equipment'),
      ])
      setExpiring(exp.data)
      setEquipments(eq.data.items)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const withInsurance = expiring.map(i => i.equipmentId)
  const withoutInsurance = equipments.filter(e => !withInsurance.includes(e.id) && e.status !== 'DECOMMISSIONED')

  function daysUntil(date: string) {
    return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  function openRenew(ins: any) {
    const start = new Date(ins.endDate)
    start.setDate(start.getDate() + 1)
    const end = new Date(start)
    end.setFullYear(end.getFullYear() + 1)
    setRenewForm({
      policyNumber: ins.policyNumber + '-R',
      premium: String(ins.premium),
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    })
    setShowRenew(ins)
  }

  async function handleRenew() {
    if (!renewForm.policyNumber || !renewForm.premium || !renewForm.startDate || !renewForm.endDate) {
      alert('Preencha todos os campos')
      return
    }
    setRenewing(true)
    try {
      await api.put(`/insurance/${showRenew.id}`, {
        policyNumber: renewForm.policyNumber,
        premium: Number(renewForm.premium),
        startDate: renewForm.startDate,
        endDate: renewForm.endDate,
      })
      setShowRenew(null)
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao renovar apolice')
    } finally {
      setRenewing(false)
    }
  }

  async function handleSubmit() {
    if (!form.equipmentId || !form.policyNumber || !form.insurer || !form.insuredValue || !form.premium || !form.startDate || !form.endDate) {
      alert('Preencha todos os campos obrigatorios')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/insurance', {
        ...form,
        insuredValue: Number(form.insuredValue),
        premium: Number(form.premium),
      })
      setShowForm(false)
      setForm({ equipmentId: '', policyNumber: '', insurer: '', insuredValue: '', premium: '', startDate: '', endDate: '', coverage: '' })
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cadastrar apolice')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-white">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Seguros</h1>
          <p style={{ color: 'var(--muted)' }}>Apólices e sinistros da frota</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--primary)' }}>
          <Plus size={16} />
          Nova Apólice
        </button>
      </div>

      {/* Veículos sem seguro */}
      {withoutInsurance.length > 0 && (
        <div className="p-4 rounded-xl border" style={{ backgroundColor: '#450a0a', borderColor: '#ef444444' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
            <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>
              {withoutInsurance.length} veículo(s) sem seguro ativo
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {withoutInsurance.map(e => (
              <span key={e.id} className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: '#0f172a', color: '#ef4444' }}>
                {e.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Apólices ativas */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Apólices Ativas</h2>
        {expiring.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--muted)' }}>
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhuma apolice cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expiring.map(ins => {
              const days = daysUntil(ins.endDate)
              const urgent = days <= 30
              const warning = days <= 90
              return (
                <div key={ins.id} className="p-5 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: urgent ? '#ef4444' : warning ? '#f59e0b44' : 'var(--card-border)',
                  }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-white font-semibold">{ins.equipment?.name || 'Veículo'}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{ins.insurer}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: urgent ? '#450a0a' : warning ? '#451a03' : '#052e16',
                        color: urgent ? '#ef4444' : warning ? '#f59e0b' : '#22c55e',
                      }}>
                      {days <= 0 ? 'Vencida' : `${days} dias`}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted)' }}>Apólice</span>
                      <span className="text-white">{ins.policyNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted)' }}>Valor segurado</span>
                      <span className="text-white">R$ {Number(ins.insuredValue).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted)' }}>Prêmio anual</span>
                      <span className="text-white">R$ {Number(ins.premium).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--muted)' }}>Vigência</span>
                      <span className="text-white text-xs">
                        {new Date(ins.startDate).toLocaleDateString('pt-BR')} — {new Date(ins.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="pt-2">
                    <button onClick={() => openRenew(ins)}
                      className="w-full py-2 rounded-lg text-xs font-medium text-white"
                      style={{ backgroundColor: '#1e3a5f' }}>
                      Renovar Apólice
                    </button>
                  </div>
                  {ins.coverage && (
                      <div className="pt-2 text-xs" style={{ color: 'var(--muted)' }}>{ins.coverage}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal nova apolice */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-screen"
            style={{ backgroundColor: 'var(--card)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Nova Apólice de Seguro</h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Veículo *</label>
                <select value={form.equipmentId}
                  onChange={e => setForm(prev => ({ ...prev, equipmentId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-white outline-none"
                  style={{ backgroundColor: '#0f172a', border: '1px solid var(--card-border)' }}>
                  <option value="">Selecione o veículo</option>
                  {equipments.filter(e => e.status !== 'DECOMMISSIONED').map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              {[
                { label: 'Número da Apólice *', key: 'policyNumber', placeholder: 'POL-2026-001' },
                { label: 'Seguradora *', key: 'insurer', placeholder: 'Porto Seguro, Allianz...' },
                { label: 'Valor Segurado (R$) *', key: 'insuredValue', placeholder: '200000' },
                { label: 'Prêmio Anual (R$) *', key: 'premium', placeholder: '8000' },
                { label: 'Inicio da Vigência *', key: 'startDate', placeholder: '', type: 'date' },
                { label: 'Fim da Vigência *', key: 'endDate', placeholder: '', type: 'date' },
                { label: 'Cobertura', key: 'coverage', placeholder: 'Roubo, colisao, dano total...' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-white mb-2 block">{label}</label>
                  <input
                    type={type || 'text'}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl text-white outline-none"
                    style={{ backgroundColor: '#0f172a', border: '1px solid var(--card-border)' }}
                  />
                </div>
              ))}
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}>
                {submitting ? 'Cadastrando...' : 'Cadastrar Apólice'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal renovacao */}
      {showRenew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: 'var(--card)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Renovar Apólice</h2>
              <button onClick={() => setShowRenew(null)} style={{ color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
              {showRenew.equipment?.name} — {showRenew.insurer}
            </p>
            <div className="space-y-4">
              {[
                { label: 'Novo numero da apolice', key: 'policyNumber', placeholder: 'POL-2026-001' },
                { label: 'Novo premio anual (R$)', key: 'premium', placeholder: '8000' },
                { label: 'Inicio da vigencia', key: 'startDate', type: 'date' },
                { label: 'Fim da vigencia', key: 'endDate', type: 'date' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-white mb-2 block">{label}</label>
                  <input
                    type={type || 'text'}
                    value={renewForm[key as keyof typeof renewForm]}
                    onChange={e => setRenewForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder || ''}
                    className="w-full px-4 py-3 rounded-xl text-white outline-none"
                    style={{ backgroundColor: '#0f172a', border: '1px solid var(--card-border)' }}
                  />
                </div>
              ))}
              <button onClick={handleRenew} disabled={renewing}
                className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: '#22c55e' }}>
                {renewing ? 'Renovando...' : 'Confirmar Renovação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
