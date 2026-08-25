'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Rental } from '@/types'
import { Calendar, CheckCircle, Clock } from 'lucide-react'

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    api.get('/rentals')
      .then(({ data }) => {
        setRentals(data.items || data)
        setTotal(data.total)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Locações</h1>
          <p style={{ color: 'var(--muted)' }}>{total} locacoes registradas</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--card)' }} />
          ))}
        </div>
      ) : rentals.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <div className="text-5xl mb-4">📋</div>
          <div className="text-lg font-medium text-white mb-1">Nenhuma locacao registrada</div>
        </div>
      ) : (
        <div className="space-y-3">
          {rentals.map(rental => {
            const active = !rental.checkinDate
            return (
              <div key={rental.id} className="p-5 rounded-xl border"
                style={{ backgroundColor: 'var(--card)', borderColor: active ? '#3b82f6' : 'var(--card-border)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {active
                        ? <Clock size={16} style={{ color: '#3b82f6' }} />
                        : <CheckCircle size={16} style={{ color: '#22c55e' }} />
                      }
                      <span className="text-white font-medium text-sm">
                        {rental.equipment?.name || 'Equipamento'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: active ? '#172554' : '#052e16', color: active ? '#3b82f6' : '#22c55e' }}>
                        {active ? 'Em andamento' : 'Concluída'}
                      </span>
                    </div>
                    <div className="text-xs space-y-0.5" style={{ color: 'var(--muted)' }}>
                      <div>Cliente: {rental.client?.name || '—'}</div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        Checkout: {new Date(rental.checkoutDate).toLocaleDateString('pt-BR')}
                        {rental.checkinDate && (
                          <> • Checkin: {new Date(rental.checkinDate).toLocaleDateString('pt-BR')}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {rental.totalAmount ? (
                      <>
                        <div className="text-white font-bold">
                          R$ {Number(rental.totalAmount).toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--muted)' }}>
                          {rental.totalDays} dias x R$ {Number(rental.dailyRate).toLocaleString('pt-BR')}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm" style={{ color: 'var(--muted)' }}>
                        R$ {Number(rental.dailyRate).toLocaleString('pt-BR')}/dia
                      </div>
                    )}
                    {rental.checkinCondition && (
                      <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                        Condicao: {rental.checkinCondition}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
