'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, Wrench, AlertTriangle, Phone, Car, Calendar, Hash } from 'lucide-react'

const statusConfig = {
  AVAILABLE:      { label: 'Disponível para uso', color: '#22c55e', bg: '#052e16', icon: CheckCircle },
  RENTED:         { label: 'Em uso pelo cliente', color: '#3b82f6', bg: '#172554', icon: Car },
  MAINTENANCE:    { label: 'Em manutencao', color: '#f59e0b', bg: '#451a03', icon: Wrench },
  DECOMMISSIONED: { label: 'Fora de operacao', color: '#64748b', bg: '#0f172a', icon: AlertTriangle },
}

export default function PublicEquipmentPage() {
  const { id } = useParams()
  const [equipment, setEquipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [chamadoAberto, setChamadoAberto] = useState(false)
  const [chamado, setChamado] = useState({ tipo: 'avaria', descricao: '' })

  useEffect(() => {
    fetch(`http://localhost:3001/equipment/public/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(true)
        else setEquipment(data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f172a' }}>
      <div className="text-white text-lg">Carregando...</div>
    </div>
  )

  if (error || !equipment) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f172a' }}>
      <div className="text-center">
        <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: '#ef4444' }} />
        <div className="text-white text-lg">Veículo nao encontrado</div>
      </div>
    </div>
  )

  const s = statusConfig[equipment.status as keyof typeof statusConfig]
  const StatusIcon = s.icon

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: '#0f172a' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-6 text-center">
        <div className="text-xs font-semibold mb-2 tracking-widest" style={{ color: '#64748b' }}>
          FLEETFLOW — FICHA DO VEICULO
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{equipment.name}</h1>
        <p style={{ color: '#64748b' }}>{equipment.brand} {equipment.model} • {equipment.year}</p>
      </div>

      {/* Foto */}
      {equipment.photos?.[0] && (
        <div className="px-4 mb-6">
          <img src={equipment.photos[0]} alt={equipment.name}
            className="w-full max-w-sm mx-auto rounded-2xl object-cover h-48" />
        </div>
      )}

      {/* Status */}
      <div className="px-4 mb-6">
        <div className="max-w-sm mx-auto p-4 rounded-2xl flex items-center gap-4"
          style={{ backgroundColor: s.bg, border: `1px solid ${s.color}` }}>
          <StatusIcon size={28} style={{ color: s.color }} />
          <div>
            <div className="text-xs" style={{ color: s.color }}>Status atual</div>
            <div className="text-white font-semibold">{s.label}</div>
          </div>
        </div>
      </div>

      {/* Ficha tecnica */}
      <div className="px-4 mb-6">
        <div className="max-w-sm mx-auto p-5 rounded-2xl" style={{ backgroundColor: '#1e293b' }}>
          <h2 className="text-sm font-semibold text-white mb-4">Ficha Tecnica</h2>
          <div className="space-y-3">
            {[
              { icon: Car, label: 'Categoria', value: equipment.category },
              { icon: Hash, label: 'Modelo', value: `${equipment.brand} ${equipment.model}` },
              { icon: Calendar, label: 'Ano', value: equipment.year },
              { icon: Hash, label: 'Diária', value: `R$ ${Number(equipment.dailyRate).toLocaleString('pt-BR')}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={16} style={{ color: '#64748b' }} />
                <span style={{ color: '#64748b' }} className="text-sm w-24">{label}</span>
                <span className="text-white text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botao abrir chamado */}
      <div className="px-4 mb-4 max-w-sm mx-auto">
        {!chamadoAberto ? (
          <button
            onClick={() => setChamadoAberto(true)}
            className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-3"
            style={{ backgroundColor: '#ef4444' }}>
            <AlertTriangle size={20} />
            Reportar Avaria ou Solicitar Suporte
          </button>
        ) : (
          <div className="p-5 rounded-2xl" style={{ backgroundColor: '#1e293b' }}>
            <h3 className="text-white font-semibold mb-4">Abrir Chamado</h3>
            <div className="space-y-3">
              <select
                value={chamado.tipo}
                onChange={e => setChamado(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-white outline-none"
                style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}>
                <option value="avaria">Avaria mecanica</option>
                <option value="acidente">Acidente / Sinistro</option>
                <option value="pneu">Problema com pneu</option>
                <option value="eletrico">Problema eletrico</option>
                <option value="outro">Outro</option>
              </select>
              <textarea
                value={chamado.descricao}
                onChange={e => setChamado(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o problema..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-white outline-none resize-none"
                style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
              <button
                onClick={() => {
                  alert(`Chamado registrado!\nTipo: ${chamado.tipo}\nVeículo: ${equipment.name}\nAguarde contato da equipe.`)
                  setChamadoAberto(false)
                  setChamado({ tipo: 'avaria', descricao: '' })
                }}
                className="w-full py-3 rounded-xl font-semibold text-white"
                style={{ backgroundColor: '#ef4444' }}>
                Enviar Chamado
              </button>
              <button
                onClick={() => setChamadoAberto(false)}
                className="w-full py-3 rounded-xl text-sm"
                style={{ color: '#64748b' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contato */}
      <div className="px-4 max-w-sm mx-auto">
        <a href="tel:+556199990000"
          className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-3"
          style={{ backgroundColor: '#1e293b', color: '#22c55e' }}>
          <Phone size={20} />
          Ligar para a Central
        </a>
      </div>

      <div className="text-center mt-8 text-xs" style={{ color: '#334155' }}>
        FleetFlow • Sistema de Gestao de Frota
      </div>
    </div>
  )
}
