'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Equipment, EquipmentStatus } from '@/types'
import { Plus, Search, LogIn, LogOut, Wrench } from 'lucide-react'
import CheckinModal from '@/components/CheckinModal'
import CheckoutModal from '@/components/CheckoutModal'
import MaintenanceModal from '@/components/MaintenanceModal'

const statusConfig: Record<EquipmentStatus, { label: string; color: string; bg: string }> = {
  AVAILABLE:      { label: 'Disponivel',   color: '#22c55e', bg: '#052e16' },
  RENTED:         { label: 'Alugado',      color: '#3b82f6', bg: '#172554' },
  MAINTENANCE:    { label: 'Manutencao',   color: '#f59e0b', bg: '#451a03' },
  DECOMMISSIONED: { label: 'Baixado',      color: '#64748b', bg: '#0f172a' },
}

export default function DashboardPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | ''>('')
  const [total, setTotal] = useState(0)
  const [modal, setModal] = useState<'checkin' | 'checkout' | 'maintenance' | null>(null)

  const fetchEquipment = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get('/equipment', { params })
      setEquipment(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { fetchEquipment() }, [fetchEquipment])

  const statusCounts = equipment.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Painel de Frota</h1>
          <p style={{ color: 'var(--muted)' }}>{total} veiculos cadastrados</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setModal('checkin')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#22c55e' }}>
            <LogIn size={16} />
            Check-in (Retirada)
          </button>
          <button onClick={() => setModal('checkout')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#3b82f6' }}>
            <LogOut size={16} />
            Check-out (Devolucao)
          </button>
          <button onClick={() => setModal('maintenance')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: '#f59e0b' }}>
            <Wrench size={16} />
            Manutencao
          </button>
          <Link href="/dashboard/equipment/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--primary)' }}>
            <Plus size={16} />
            Veiculo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(statusConfig) as EquipmentStatus[]).map(status => (
          <button key={status} onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
            className="p-4 rounded-xl border text-left transition-all"
            style={{
              backgroundColor: statusFilter === status ? statusConfig[status].bg : 'var(--card)',
              borderColor: statusFilter === status ? statusConfig[status].color : 'var(--card-border)',
            }}>
            <div className="text-2xl font-bold text-white">{statusCounts[status] || 0}</div>
            <div className="text-sm mt-1" style={{ color: statusConfig[status].color }}>
              {statusConfig[status].label}
            </div>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, marca, modelo ou placa..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-white outline-none"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--card)' }} />
          ))}
        </div>
      ) : equipment.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <div className="text-5xl mb-4">🚗</div>
          <div className="text-lg font-medium text-white mb-1">Nenhum veiculo encontrado</div>
          <div className="text-sm">Cadastre o primeiro veiculo da frota</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {equipment.map(eq => {
            const s = statusConfig[eq.status]
            const firstPhoto = eq.photos?.[0]
            return (
              <Link key={eq.id} href={`/dashboard/equipment/${eq.id}`}
                className="block p-5 rounded-xl border transition-all hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
                <div className="w-full h-28 rounded-lg mb-4 overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: '#0f172a' }}>
                  {firstPhoto ? (
                    <img src={firstPhoto} alt={eq.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🚗</span>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ backgroundColor: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{eq.year}</span>
                </div>
                <h3 className="font-semibold text-white text-sm truncate">{eq.name}</h3>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                  {eq.brand} {eq.model}
                </p>
                <p className="text-sm font-medium mt-2" style={{ color: 'var(--primary)' }}>
                  R$ {Number(eq.dailyRate).toLocaleString('pt-BR')}/dia
                </p>
              </Link>
            )
          })}
        </div>
      )}

      {modal === 'checkin' && <CheckinModal onClose={() => setModal(null)} onSuccess={fetchEquipment} />}
      {modal === 'checkout' && <CheckoutModal onClose={() => setModal(null)} onSuccess={fetchEquipment} />}
      {modal === 'maintenance' && <MaintenanceModal onClose={() => setModal(null)} onSuccess={fetchEquipment} />}
    </div>
  )
}
