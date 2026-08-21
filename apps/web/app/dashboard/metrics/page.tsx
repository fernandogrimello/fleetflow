'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react'

export default function MetricsPage() {
  const [ranking, setRanking] = useState<any>(null)
  const [occupancy, setOccupancy] = useState<any[]>([])
  const [maintenanceCost, setMaintenanceCost] = useState<any[]>([])
  const [roi, setRoi] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/metrics/ranking'),
      api.get('/metrics/occupancy'),
      api.get('/metrics/maintenance-cost'),
      api.get('/metrics/roi'),
    ]).then(([r, o, m, roi]) => {
      setRanking(r.data)
      setOccupancy(o.data)
      setMaintenanceCost(m.data)
      setRoi(roi.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-white">Carregando metricas...</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Metricas de Decisao</h1>
        <p style={{ color: 'var(--muted)' }}>Analise de desempenho da frota</p>
      </div>

      {/* ROI ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} style={{ color: '#22c55e' }} />
            <h2 className="text-sm font-semibold text-white">Melhor ROI</h2>
          </div>
          <div className="space-y-3">
            {roi?.best?.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: 'var(--card-border)' }}>
                <div>
                  <div className="text-sm text-white font-medium">{e.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{e.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: e.roi >= 0 ? '#22c55e' : '#ef4444' }}>
                    {e.roi.toFixed(1)}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    R$ {e.totalRevenue.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} style={{ color: '#ef4444' }} />
            <h2 className="text-sm font-semibold text-white">Pior ROI</h2>
          </div>
          <div className="space-y-3">
            {roi?.worst?.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: 'var(--card-border)' }}>
                <div>
                  <div className="text-sm text-white font-medium">{e.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{e.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: e.roi >= 0 ? '#22c55e' : '#ef4444' }}>
                    {e.roi.toFixed(1)}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    R$ {e.netProfit.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Occupancy */}
      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h2 className="text-sm font-semibold text-white mb-4">Taxa de Ocupacao</h2>
        <div className="space-y-4">
          {occupancy.map((e: any) => (
            <div key={e.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white">{e.name}</span>
                <span style={{ color: 'var(--muted)' }}>{Math.min(e.occupancyRate, 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: '#0f172a' }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(e.occupancyRate, 100)}%`,
                    backgroundColor: e.occupancyRate >= 70 ? '#22c55e' : e.occupancyRate >= 40 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                {e.totalDaysRented} dias alugado
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: '#22c55e' }} />
            <h2 className="text-sm font-semibold text-white">Mais Alugados</h2>
          </div>
          <div className="space-y-3">
            {ranking?.mostRented?.map((e: any, i: number) => (
              <div key={e.id} className="flex items-center gap-3 py-2 border-b last:border-0"
                style={{ borderColor: 'var(--card-border)' }}>
                <span className="text-lg font-bold w-6" style={{ color: 'var(--muted)' }}>#{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm text-white">{e.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{e.totalRentals} locacoes</div>
                </div>
                <div className="text-sm font-medium" style={{ color: '#22c55e' }}>
                  R$ {e.totalRevenue.toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} style={{ color: '#ef4444' }} />
            <h2 className="text-sm font-semibold text-white">Menos Alugados</h2>
          </div>
          <div className="space-y-3">
            {ranking?.leastRented?.map((e: any, i: number) => (
              <div key={e.id} className="flex items-center gap-3 py-2 border-b last:border-0"
                style={{ borderColor: 'var(--card-border)' }}>
                <span className="text-lg font-bold w-6" style={{ color: 'var(--muted)' }}>#{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm text-white">{e.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{e.totalRentals} locacoes</div>
                </div>
                <div className="text-sm font-medium" style={{ color: '#ef4444' }}>
                  Candidato a venda
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance cost by category */}
      {maintenanceCost.length > 0 && (
        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h2 className="text-sm font-semibold text-white mb-4">Custo Medio de Manutencao por Categoria</h2>
          <div className="space-y-3">
            {maintenanceCost.map((c: any) => (
              <div key={c.category} className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: 'var(--card-border)' }}>
                <div>
                  <div className="text-sm text-white">{c.category}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{c.maintenanceCount} manutencoes</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">R$ {c.averageCost.toLocaleString('pt-BR')}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>media por OS</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
