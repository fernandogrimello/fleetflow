'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export default function InsurancePage() {
  const [expiring, setExpiring] = useState<any[]>([])
  const [equipments, setEquipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/insurance/expiring?days=365'),
      api.get('/equipment'),
    ]).then(([exp, eq]) => {
      setExpiring(exp.data)
      setEquipments(eq.data.items)
    }).finally(() => setLoading(false))
  }, [])

  const withInsurance = expiring.map(i => i.equipmentId)
  const withoutInsurance = equipments.filter(e => !withInsurance.includes(e.id) && e.status !== 'DECOMMISSIONED')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Seguros</h1>
        <p style={{ color: 'var(--muted)' }}>Apolices e sinistros da frota</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Apolices Ativas', value: expiring.length, color: '#22c55e', bg: '#052e16' },
          { label: 'Sem Seguro', value: withoutInsurance.length, color: '#ef4444', bg: '#450a0a' },
          { label: 'Total de Sinistros', value: expiring.reduce((s, i) => s + i.claims.length, 0), color: '#f59e0b', bg: '#451a03' },
        ].map(card => (
          <div key={card.label} className="p-5 rounded-xl border text-center"
            style={{ backgroundColor: card.bg, borderColor: card.color }}>
            <div className="text-3xl font-bold mb-1" style={{ color: card.color }}>{card.value}</div>
            <div className="text-sm text-white">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Active policies */}
      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} style={{ color: '#22c55e' }} />
          <h2 className="text-sm font-semibold text-white">Apolices Ativas</h2>
        </div>

        {loading ? (
          <div className="text-sm" style={{ color: 'var(--muted)' }}>Carregando...</div>
        ) : expiring.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--muted)' }}>Nenhuma apolice cadastrada</div>
        ) : (
          <div className="space-y-4">
            {expiring.map((ins: any) => {
              const endDate = new Date(ins.endDate)
              const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const expiringSoon = daysLeft <= 30

              return (
                <div key={ins.id} className="p-4 rounded-lg border"
                  style={{ backgroundColor: '#0f172a', borderColor: expiringSoon ? '#f59e0b' : 'var(--card-border)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {expiringSoon
                          ? <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
                          : <CheckCircle size={14} style={{ color: '#22c55e' }} />
                        }
                        <span className="text-white font-medium text-sm">{ins.equipment.name}</span>
                      </div>
                      <div className="text-xs space-y-0.5" style={{ color: 'var(--muted)' }}>
                        <div>Seguradora: {ins.insurer} • Apolice: {ins.policyNumber}</div>
                        <div>Vencimento: {endDate.toLocaleDateString('pt-BR')}
                          <span className="ml-1" style={{ color: expiringSoon ? '#f59e0b' : 'var(--muted)' }}>
                            ({daysLeft > 0 ? `${daysLeft} dias restantes` : 'Vencida'})
                          </span>
                        </div>
                        {ins.coverage && <div>Cobertura: {ins.coverage}</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-sm">
                        R$ {Number(ins.insuredValue).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>valor segurado</div>
                      <div className="text-xs mt-1" style={{ color: '#f59e0b' }}>
                        {ins.claims.length} sinistro(s)
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Without insurance */}
      {withoutInsurance.length > 0 && (
        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: '#ef4444' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} style={{ color: '#ef4444' }} />
            <h2 className="text-sm font-semibold text-white">Equipamentos sem Seguro</h2>
          </div>
          <div className="space-y-2">
            {withoutInsurance.map((eq: any) => (
              <div key={eq.id} className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: 'var(--card-border)' }}>
                <div>
                  <div className="text-sm text-white">{eq.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{eq.brand} {eq.model}</div>
                </div>
                <div className="text-sm font-medium" style={{ color: '#ef4444' }}>Sem cobertura</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
