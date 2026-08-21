'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Equipment, EquipmentROI } from '@/types'
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react'

export default function FinancialPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [selected, setSelected] = useState<string>('')
  const [roi, setRoi] = useState<EquipmentROI | null>(null)
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
    api.get(`/financial/equipment/${selected}`)
      .then(({ data }) => setRoi(data))
      .finally(() => setLoading(false))
  }, [selected])

  const cards = roi ? [
    { label: 'Valor de Aquisicao', value: roi.purchasePrice, color: 'var(--muted)', icon: DollarSign },
    { label: 'Total Arrecadado', value: roi.totalRevenue, color: '#22c55e', icon: TrendingUp },
    { label: 'Custo Manutencoes', value: roi.totalMaintenanceCost, color: '#ef4444', icon: TrendingDown },
    { label: 'Custo Seguros', value: roi.totalInsuranceCost, color: '#f59e0b', icon: DollarSign },
    { label: 'Lucro Liquido', value: roi.netProfit, color: roi.netProfit >= 0 ? '#22c55e' : '#ef4444', icon: DollarSign },
    { label: 'Receita Perdida', value: roi.lostRevenue, color: '#f59e0b', icon: Clock },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Financeiro</h1>
        <p style={{ color: 'var(--muted)' }}>Analise de ROI por equipamento</p>
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
        <div className="flex items-center justify-center h-40">
          <div className="text-white">Carregando...</div>
        </div>
      ) : roi && (
        <>
          {/* ROI badge */}
          <div className="p-6 rounded-xl border text-center"
            style={{ backgroundColor: roi.roiPositive ? '#052e16' : '#450a0a', borderColor: roi.roiPositive ? '#22c55e' : '#ef4444' }}>
            <div className="text-4xl font-bold mb-1" style={{ color: roi.roiPositive ? '#22c55e' : '#ef4444' }}>
              {roi.roi.toFixed(2)}%
            </div>
            <div className="text-sm text-white">ROI — Retorno sobre Investimento</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              {roi.roiPositive ? 'Equipamento ja se pagou' : 'Equipamento ainda nao se pagou'}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              {roi.totalRentals} locacoes • {roi.downtimeDays} dias em manutencao
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="p-5 rounded-xl border"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color }} />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
                </div>
                <div className="text-xl font-bold" style={{ color }}>
                  R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
