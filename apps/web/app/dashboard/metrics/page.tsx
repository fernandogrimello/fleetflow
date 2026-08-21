'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { TrendingUp, TrendingDown, Award, AlertTriangle, Brain, RefreshCw } from 'lucide-react'

export default function MetricsPage() {
  const [ranking, setRanking] = useState<any>(null)
  const [occupancy, setOccupancy] = useState<any[]>([])
  const [roi, setRoi] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingAi, setLoadingAi] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/metrics/ranking'),
      api.get('/metrics/occupancy'),
      api.get('/metrics/roi'),
    ]).then(([r, o, roi]) => {
      setRanking(r.data)
      setOccupancy(o.data)
      setRoi(roi.data)
    }).finally(() => setLoading(false))
  }, [])

  async function loadAiAnalysis() {
    setLoadingAi(true)
    try {
      const { data } = await api.get('/ai/fleet-analysis')
      setAiAnalysis(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAi(false)
    }
  }

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

      {/* IA Analysis */}
      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: '#7c3aed' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={18} style={{ color: '#a78bfa' }} />
            <h2 className="text-sm font-semibold text-white">Analise da Frota por IA (Gemini)</h2>
          </div>
          <button onClick={loadAiAnalysis} disabled={loadingAi}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#7c3aed' }}>
            <RefreshCw size={14} className={loadingAi ? 'animate-spin' : ''} />
            {loadingAi ? 'Analisando...' : aiAnalysis ? 'Reanalisar' : 'Analisar com IA'}
          </button>
        </div>

        {!aiAnalysis && !loadingAi && (
          <div className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>
            Clique em "Analisar com IA" para obter recomendacoes estrategicas da sua frota
          </div>
        )}

        {loadingAi && (
          <div className="text-sm text-center py-6" style={{ color: '#a78bfa' }}>
            Gemini esta analisando sua frota...
          </div>
        )}

        {aiAnalysis && (
          <div className="space-y-4">
            <p className="text-sm text-white leading-relaxed">{aiAnalysis.resumoGeral}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiAnalysis.candidatosBaixa?.length > 0 && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#450a0a' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} style={{ color: '#ef4444' }} />
                    <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>Candidatos a Baixa</span>
                  </div>
                  {aiAnalysis.candidatosBaixa.map((item: any, i: number) => (
                    <div key={i} className="text-xs mb-2">
                      <span className="text-white font-medium">{item.nome}:</span>
                      <span className="ml-1" style={{ color: 'var(--muted)' }}>{item.motivo}</span>
                    </div>
                  ))}
                </div>
              )}

              {aiAnalysis.maisRentaveis?.length > 0 && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#052e16' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={14} style={{ color: '#22c55e' }} />
                    <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>Mais Rentaveis</span>
                  </div>
                  {aiAnalysis.maisRentaveis.map((item: any, i: number) => (
                    <div key={i} className="text-xs mb-2">
                      <span className="text-white font-medium">{item.nome}:</span>
                      <span className="ml-1" style={{ color: 'var(--muted)' }}>{item.destaque}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {aiAnalysis.recomendacoesEstrategicas?.length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: '#a78bfa' }}>Recomendacoes Estrategicas</div>
                <ul className="space-y-2">
                  {aiAnalysis.recomendacoesEstrategicas.map((rec: string, i: number) => (
                    <li key={i} className="flex gap-2 text-xs">
                      <span style={{ color: '#a78bfa' }}>•</span>
                      <span style={{ color: 'var(--muted)' }}>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
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
                <div className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(e.occupancyRate, 100)}%`,
                    backgroundColor: e.occupancyRate >= 70 ? '#22c55e' : e.occupancyRate >= 40 ? '#f59e0b' : '#ef4444',
                  }} />
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{e.totalDaysRented} dias alugado</div>
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
                <div className="text-sm font-medium" style={{ color: '#ef4444' }}>Candidato a venda</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
