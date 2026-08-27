'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl

// Suprime erro de LatLng durante animacao inicial
const originalOnError = window.onerror
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.message?.includes('Invalid LatLng')) e.preventDefault()
  })
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const statusColors: Record<string, string> = {
  AVAILABLE: '#22c55e',
  RENTED: '#3b82f6',
  MAINTENANCE: '#f59e0b',
}

function createIcon(status: string, warning: boolean) {
  const color = warning ? '#ef4444' : (statusColors[status] || '#64748b')
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 32px; height: 32px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

function FlyTo({ selected }: { selected: any }) {
  const map = useMap()
  useEffect(() => {
    if (selected?.lastLocation) {
      const lat = parseFloat(selected.lastLocation.latitude)
      const lng = parseFloat(selected.lastLocation.longitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        const doFly = () => {
          try {
            map.flyTo([lat, lng], 14, { duration: 1.2, easeLinearity: 0.25 })
          } catch(e) {
            setTimeout(() => {
              try { map.setView([lat, lng], 14) } catch(e2) {}
            }, 300)
          }
        }
        if (map.getContainer().getBoundingClientRect().width > 0) {
          doFly()
        } else {
          setTimeout(doFly, 600)
        }
      }
    }
  }, [selected, map])
  return null
}

interface Props {
  fleet: any[]
  selected: any
  onSelect: (v: any) => void
}

export default function FleetMap({ fleet, selected, onSelect }: Props) {
  const center: [number, number] = [-15.7942, -47.8825]

  return (
    <MapContainer center={center} zoom={11} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo selected={selected} />
      {fleet.map(v => (
        <Marker
          key={v.id}
          position={[parseFloat(v.lastLocation.latitude), parseFloat(v.lastLocation.longitude)]}
          icon={createIcon(v.status, v.odometerWarning)}
          eventHandlers={{ click: () => onSelect(v) }}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{v.name}</div>
              <div style={{ fontSize: 12, color: statusColors[v.status] }}>
                {v.status === 'AVAILABLE' ? 'Disponível' : v.status === 'RENTED' ? 'Alugado' : 'Manutenção'}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Hodômetro: {v.odometer.toLocaleString('pt-BR')} km
              </div>
              {v.odometerWarning && (
                <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 2 }}>
                  ⚠ Revisão necessária
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
