'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { Equipment, Rental, Maintenance } from '@/types'
import { ArrowLeft, Calendar, Wrench, DollarSign, QrCode, Camera } from 'lucide-react'

const statusConfig = {
  AVAILABLE:      { label: 'Disponivel',   color: '#22c55e', bg: '#052e16' },
  RENTED:         { label: 'Alugado',      color: '#3b82f6', bg: '#172554' },
  MAINTENANCE:    { label: 'Manutencao',   color: '#f59e0b', bg: '#451a03' },
  DECOMMISSIONED: { label: 'Baixado',      color: '#64748b', bg: '#0f172a' },
}

export default function EquipmentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment & { rentals: Rental[]; maintenances: Maintenance[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [generatingQR, setGeneratingQR] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function fetchEquipment() {
    try {
      const { data } = await api.get(`/equipment/${id}`)
      setEquipment(data)
    } catch {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEquipment() }, [id])

  async function handleGenerateQR() {
    setGeneratingQR(true)
    try {
      await api.post(`/equipment/${id}/qrcode`)
      await fetchEquipment()
      setShowQR(true)
    } finally {
      setGeneratingQR(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return
    setUploading(true)
    const formData = new FormData()
    Array.from(e.target.files).forEach(f => formData.append('photos', f))
    try {
      await api.post(`/equipment/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchEquipment()
    } finally {
      setUploading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-white">Carregando...</div>
    </div>
  )

  if (!equipment) return null

  const s = statusConfig[equipment.status]

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{equipment.name}</h1>
          <p style={{ color: 'var(--muted)' }}>{equipment.brand} {equipment.model} • {equipment.year}</p>
        </div>
        <span className="text-sm font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: s.bg, color: s.color }}>
          {s.label}
        </span>
      </div>

      {/* Fotos */}
      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Fotos</h2>
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer"
            style={{ backgroundColor: uploading ? 'var(--muted)' : 'var(--primary)' }}>
            <Camera size={14} />
            {uploading ? 'Enviando...' : 'Adicionar Fotos'}
            <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
        {equipment.photos?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {equipment.photos.map((photo, i) => (
              <img key={i} src={photo} alt={`Foto ${i + 1}`}
                className="w-full h-28 object-cover rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center rounded-lg text-sm"
            style={{ backgroundColor: '#0f172a', color: 'var(--muted)' }}>
            Nenhuma foto cadastrada
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h2 className="text-sm font-semibold text-white mb-4">Informacoes</h2>
          <div className="space-y-3 text-sm">
            {[
              ['Categoria', equipment.category],
              ['Numero de Serie', equipment.serialNumber],
              ['Diaria', `R$ ${Number(equipment.dailyRate).toLocaleString('pt-BR')}`],
              ['Valor de Aquisicao', `R$ ${Number(equipment.purchasePrice).toLocaleString('pt-BR')}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h2 className="text-sm font-semibold text-white mb-4">Resumo</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Calendar, label: 'Locacoes', value: equipment.rentals?.length || 0, color: '#3b82f6' },
              { icon: Wrench, label: 'Manutencoes', value: equipment.maintenances?.length || 0, color: '#f59e0b' },
              { icon: DollarSign, label: 'Receita', value: `R$${(equipment.rentals?.reduce((s, r) => s + Number(r.totalAmount || 0), 0) || 0).toLocaleString('pt-BR')}`, color: '#22c55e' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="text-center p-3 rounded-lg" style={{ backgroundColor: '#0f172a' }}>
                <Icon size={18} className="mx-auto mb-1" style={{ color }} />
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">QR Code</h2>
          <button onClick={handleGenerateQR} disabled={generatingQR}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#7c3aed' }}>
            <QrCode size={14} />
            {generatingQR ? 'Gerando...' : equipment.qrCode ? 'Regenerar' : 'Gerar QR Code'}
          </button>
        </div>
        {equipment.qrCode && (showQR || true) ? (
          <div className="flex flex-col items-center gap-3">
            <img src={equipment.qrCode} alt="QR Code" className="w-48 h-48 rounded-lg" />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              Aponte a camera para acessar a pagina publica do veiculo
            </p>
            <a href={`/equipment/public/${equipment.id}`} target="_blank"
              className="text-xs" style={{ color: 'var(--primary)' }}>
              Ver pagina publica
            </a>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center rounded-lg text-sm"
            style={{ backgroundColor: '#0f172a', color: 'var(--muted)' }}>
            Clique em "Gerar QR Code" para criar o codigo
          </div>
        )}
      </div>

      {/* Rental history */}
      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h2 className="text-sm font-semibold text-white mb-4">Historico de Locacoes</h2>
        {equipment.rentals?.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Nenhuma locacao registrada</p>
        ) : (
          <div className="space-y-3">
            {equipment.rentals?.map(rental => (
              <div key={rental.id} className="flex items-center justify-between py-3 border-b last:border-0"
                style={{ borderColor: 'var(--card-border)' }}>
                <div>
                  <div className="text-sm text-white">{new Date(rental.checkoutDate).toLocaleDateString('pt-BR')}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {rental.totalDays ? `${rental.totalDays} dias` : 'Em andamento'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: rental.checkinDate ? '#22c55e' : '#f59e0b' }}>
                    {rental.checkinDate ? 'Concluida' : 'Em andamento'}
                  </div>
                  {rental.totalAmount && (
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      R$ {Number(rental.totalAmount).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance history */}
      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h2 className="text-sm font-semibold text-white mb-4">Historico de Manutencoes</h2>
        {equipment.maintenances?.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Nenhuma manutencao registrada</p>
        ) : (
          <div className="space-y-3">
            {equipment.maintenances?.map(m => (
              <div key={m.id} className="flex items-center justify-between py-3 border-b last:border-0"
                style={{ borderColor: 'var(--card-border)' }}>
                <div>
                  <div className="text-sm text-white">{m.description}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {m.type === 'PREVENTIVE' ? 'Preventiva' : 'Corretiva'} • {new Date(m.scheduledDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: m.releaseDate ? '#052e16' : '#451a03', color: m.releaseDate ? '#22c55e' : '#f59e0b' }}>
                  {m.releaseDate ? 'Concluida' : 'Em andamento'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
