'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { ArrowLeft } from 'lucide-react'

export default function NewEquipmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', category: '', brand: '', model: '',
    year: new Date().getFullYear(), serialNumber: '',
    dailyRate: '', purchasePrice: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'year' ? Number(value) : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/equipment', {
        ...form,
        dailyRate: Number(form.dailyRate),
        purchasePrice: Number(form.purchasePrice),
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar veículo')
    } finally {
      setLoading(false)
    }
  }

  const categories = ['Carro de Passeio', 'SUV', 'Pickup', 'Van', 'Caminhão', 'Ônibus', 'Moto', 'Veículo Especial']
  const inputClass = "w-full px-4 py-3 rounded-xl border text-white outline-none focus:border-blue-500 transition-colors"
  const inputStyle = { backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }
  const labelClass = "block text-sm font-medium text-slate-300 mb-2"

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 border-b" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <Link href="/dashboard" className="text-white">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">Novo Veículo</h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Cadastrar veículo na frota</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto">

        <div>
          <label className={labelClass}>Nome</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Ex: Toyota Hilux" required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Marca</label>
          <input name="brand" value={form.brand} onChange={handleChange} placeholder="Ex: Toyota" required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Modelo</label>
          <input name="model" value={form.model} onChange={handleChange} placeholder="Ex: Hilux CD SRX 4x4" required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Número de Série</label>
          <input name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="Ex: TOY-HIL-2023-001" required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Diária (R$)</label>
          <input name="dailyRate" value={form.dailyRate} onChange={handleChange} placeholder="Ex: 850" required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Valor de Aquisição (R$)</label>
          <input name="purchasePrice" value={form.purchasePrice} onChange={handleChange} placeholder="Ex: 450000" required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className={labelClass}>Categoria</label>
          <select name="category" value={form.category} onChange={handleChange} required className={inputClass} style={inputStyle}>
            <option value="">Selecione...</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Ano</label>
          <input name="year" type="number" value={form.year} onChange={handleChange} min={1900} max={new Date().getFullYear() + 1} required className={inputClass} style={inputStyle} />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#450a0a', color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2 pb-8">
          <Link href="/dashboard"
            className="flex-1 py-3 rounded-xl text-center text-sm font-medium transition-colors"
            style={{ backgroundColor: '#1e293b', color: 'var(--muted)' }}>
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}>
            {loading ? 'Salvando...' : 'Cadastrar Veículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
