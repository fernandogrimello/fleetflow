'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import api from '@/lib/api'
import { Gauge, AlertTriangle, X, MapPin } from 'lucide-react'

const MapComponent = dynamic(() => import('@/components/FleetMap'), { ssr: false })

const statusConfig = {
  AVAILABLE:   { label: 'Disponível', color: '#22c55e' },
  RENTED:      { label: 'Alugado',    color: '#3b82f6' },
  MAINTENANCE: { label: 'Manutenção', color: '#f59e0b' },
}

export default function MapPage() {
  const [fleet, setFleet] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/telemetry/fleet-map')
      .then(({ data }) => setFleet(data))
      .finally(() => setLoading(false))
  }, [])

  const withLocation = fleet.filter(v => v.lastLocation)
  const warnings = fleet.filter(v => v.odometerWarning)

  function openMap(vehicle: any) {
    setSelected(vehicle)
    setMapOpen(true)
  }

  return (
    <div className="space-y-4">

      {/* Mapa fullscreen mobile */}
      {mapOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
          {/* Header do mapa */}
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
            <div>
              <p className="text-white font-semibold">{selected?.name}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {statusConfig[selected?.status as keyof typeof statusConfig]?.label} · {selected?.odometer?.toLocaleString('pt-BR')} km
              </p>
            </div>
            <button onClick={() => setMapOpen(false)} className="text-white p-2">
              <X size={24} />
            </button>
          </div>
          {/* Mapa */}
          <div className="flex-1">
            <MapComponent fleet={withLocation} selected={selected} onSelect={setSelected} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Mapa da Frota</h1>
          <p style={{ color: 'var(--muted)' }}>{withLocation.length} veículos com localização</p>
        </div>
        {warnings.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#451a03', color: '#f59e0b' }}>
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">{warnings.length} alerta(s) de hodômetro</span>
          </div>
        )}
      </div>

      {/* Mapa desktop */}
      <div className="hidden lg:grid grid-cols-4 gap-4" style={{ height: '600px' }}>
        <div className="col-span-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--card-border)' }}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--card)' }}>
              <div className="text-white">Carregando mapa...</div>
            </div>
          ) : (
            <MapComponent fleet={withLocation} selected={selected} onSelect={setSelected} />
          )}
        </div>
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
                      Revisão
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

      {/* Detalhe selecionado desktop */}
      {selected && (
        <div className="hidden lg:block p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-white font-semibold mb-3">{selected.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div style={{ color: 'var(--muted)' }}>Status</div>
              <div className="text-white font-medium">{statusConfig[selected.status as keyof typeof statusConfig]?.label}</div>
            </div>
            <div>
              <div style={{ color: 'var(--muted)' }}>Hodômetro</div>
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
                <div style={{ color: 'var(--muted)' }}>Última posição</div>
                <div className="text-white font-medium text-xs">
                  {new Date(selected.lastLocation.recordedAt).toLocaleString('pt-BR')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista mobile */}
      <div className="lg:hidden space-y-3">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Toque em um veículo para ver no mapa</p>
        {fleet.map(v => {
          const s = statusConfig[v.status as keyof typeof statusConfig]
          return (
            <button key={v.id} onClick={() => v.lastLocation ? openMap(v) : null}
              className="w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium">{v.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full ml-2"
                    style={{ backgroundColor: s?.color + '22', color: s?.color }}>
                    {s?.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
                  <span className="flex items-center gap-1">
                    <Gauge size={11} />
                    {v.odometer.toLocaleString('pt-BR')} km
                  </span>
                  {v.odometerWarning && (
                    <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
                      <AlertTriangle size={11} />
                      Revisão necessária
                    </span>
                  )}
                  {!v.lastLocation && (
                    <span style={{ color: '#ef4444' }}>Sem GPS</span>
                  )}
                </div>
              </div>
              <MapPin size={18} className="ml-3 shrink-0" style={{ color: v.lastLocation ? '#3b82f6' : 'var(--muted)' }} />
            </button>
          )
        })}
      </div>

    </div>
  )
}
