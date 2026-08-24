'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import api from '@/lib/api'
import { MapPin, Gauge, AlertTriangle, CheckCircle, Wrench, Car } from 'lucide-react'

const MapComponent = dynamic(() => import('@/components/FleetMap'), { ssr: false })

const statusConfig = {
  AVAILABLE:   { label: 'Disponivel', color: '#22c55e' },
  RENTED:      { label: 'Alugado',    color: '#3b82f6' },
  MAINTENANCE: { label: 'Manutencao', color: '#f59e0b' },
}

export default function MapPage() {
  const [fleet, setFleet] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/telemetry/fleet-map')
      .then(({ data }) => setFleet(data))
      .finally(() => setLoading(false))
  }, [])

  const withLocation = fleet.filter(v => v.lastLocation)
  const warnings = fleet.filter(v => v.odometerWarning)

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mapa da Frota</h1>
          <p style={{ color: 'var(--muted)' }}>{withLocation.length} veiculos com localizacao</p>
        </div>
        {warnings.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#451a03', color: '#f59e0b' }}>
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">{warnings.length} alerta(s) de hodometro</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: '600px' }}>
        {/* Mapa */}
        <div className="lg:col-span-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--card-border)' }}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--card)' }}>
              <div className="text-white">Carregando mapa...</div>
            </div>
          ) : (
            <MapComponent fleet={withLocation} selected={selected} onSelect={setSelected} />
          )}
        </div>

        {/* Lista lateral */}
        <div className="space-y-2 overflow-y-auto">
          {fleet.map(v => {
            const s = statusConfig[v.status as keyof typeof statusConfig]
            return (
              <button key={v.id} onClick={() => setSelected(v)}
                className="w-full p-3 rounded-xl border text-left transition-all"
                style={{
                  backgroundColor: selected?.id === v.id ? '#1e3a5f' : 'var(--card)',
                  borderColor: selected?.id === v.id ? '#3b82f6' : 'var(--card-border)',
                }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium truncate">{v.name}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full ml-1 shrink-0"
                    style={{ backgroundColor: s?.color + '22', color: s?.color }}>
                    {s?.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                  <span className="flex items-center gap-1">
                    <Gauge size={10} />
                    {v.odometer.toLocaleString('pt-BR')} km
                  </span>
                  {v.odometerWarning && (
                    <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
                      <AlertTriangle size={10} />
                      Revisao
                    </span>
                  )}
                  {!v.lastLocation && (
                    <span style={{ color: '#ef4444' }}>Sem GPS</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detalhe do selecionado */}
      {selected && (
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-white font-semibold mb-3">{selected.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div style={{ color: 'var(--muted)' }}>Status</div>
              <div className="text-white font-medium">{statusConfig[selected.status as keyof typeof statusConfig]?.label}</div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)' }}>Hodometro</div>
              <div className="text-white font-medium">{selected.odometer.toLocaleString('pt-BR')} km</div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)' }}>Alerta em</div>
              <div className="font-medium" style={{ color: selected.odometerWarning ? '#f59e0b' : 'var(--muted)' }}>
                {selected.odometerAlert.toLocaleString('pt-BR')} km
              </div>
            </div>
            {selected.lastLocation && (
              <div>
                <div style={{ color: 'var(--muted)' }}>Ultima posicao</div>
                <div className="text-white font-medium text-xs">
                  {new Date(selected.lastLocation.recordedAt).toLocaleString('pt-BR')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
