'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Rental } from '@/types'
import { Calendar, CheckCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const PER_PAGE = 10

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    api.get('/rentals')
      .then(({ data }) => {
        setRentals(data.items || data)
        setTotal(data.total || (data.items || data).length)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = rentals.filter(r => {
    const matchSearch = search === '' ||
      r.equipment?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.client?.name?.toLowerCase().includes(search.toLowerCase())
    const active = !r.checkinDate
    const matchFilter = filter === 'all' || (filter === 'active' && active) || (filter === 'done' && !active)
    return matchSearch && matchFilter
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleFilter(f: 'all' | 'active' | 'done') {
    setFilter(f)
    setPage(1)
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    setPage(1)
  }

  const filterBtns = [
    { key: 'all',    label: 'Todas' },
    { key: 'active', label: 'Ativas' },
    { key: 'done',   label: 'Concluídas' },
  ] as const

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Locações</h1>
          <p style={{ color: 'var(--muted)' }}>{filtered.length} locações encontradas</p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Buscar por veículo ou cliente..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border text-white outline-none"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
        />
      </div>

      {/* Filtros rápidos */}
      <div className="flex gap-2">
        {filterBtns.map(({ key, label }) => (
          <button key={key} onClick={() => handleFilter(key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: filter === key ? 'var(--primary)' : 'var(--card)',
              color: filter === key ? 'white' : 'var(--muted)',
              border: '1px solid',
              borderColor: filter === key ? 'var(--primary)' : 'var(--card-border)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--card)' }} />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <div className="text-5xl mb-4">📋</div>
          <div className="text-lg font-medium text-white mb-1">Nenhuma locação encontrada</div>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map(rental => {
            const active = !rental.checkinDate
            return (
              <div key={rental.id} className="p-4 rounded-xl border"
                style={{ backgroundColor: 'var(--card)', borderColor: active ? '#3b82f6' : 'var(--card-border)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {active
                        ? <Clock size={16} style={{ color: '#3b82f6' }} />
                        : <CheckCircle size={16} style={{ color: '#22c55e' }} />
                      }
                      <span className="text-white font-medium text-sm truncate">
                        {rental.equipment?.name || 'Veículo'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: active ? '#172554' : '#052e16', color: active ? '#3b82f6' : '#22c55e' }}>
                        {active ? 'Em andamento' : 'Concluída'}
                      </span>
                    </div>
                    <div className="text-xs space-y-0.5" style={{ color: 'var(--muted)' }}>
                      <div>Cliente: {rental.client?.name || '—'}</div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Calendar size={12} />
                        Retirada: {new Date(rental.checkoutDate).toLocaleDateString('pt-BR')}
                        {rental.checkinDate && (
                          <> • Devolução: {new Date(rental.checkinDate).toLocaleDateString('pt-BR')}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {rental.totalAmount ? (
                      <>
                        <div className="text-white font-bold">
                          R$ {Number(rental.totalAmount).toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>
                          {rental.totalDays} dias
                        </div>
                      </>
                    ) : (
                      <div className="text-sm" style={{ color: 'var(--muted)' }}>
                        R$ {Number(rental.dailyRate).toLocaleString('pt-BR')}/dia
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg disabled:opacity-40"
              style={{ backgroundColor: 'var(--card)', color: 'white' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg disabled:opacity-40"
              style={{ backgroundColor: 'var(--card)', color: 'white' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
