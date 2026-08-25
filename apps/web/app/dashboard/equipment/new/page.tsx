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

  const categories = ['Carro de Passeio', 'SUV', 'Pickup', 'Van', 'Caminhao', 'Onibus', 'Moto', 'Veículo Especial']

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} className="text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Novo Veículo</h1>
          <p style={{ color: 'var(--muted)' }}>Cadastrar veículo na frota</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-xl border space-y-4"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'name', label: 'Nome', placeholder: 'Ex: Toyota Hilux' },
            { name: 'brand', label: 'Marca', placeholder: 'Ex: Toyota' },
            { name: 'model', label: 'Modelo', placeholder: 'Ex: Hilux CD SRX 4x4' },
            { name: 'serialNumber', label: 'Número de Serie', placeholder: 'Ex: TOY-HIL-2023-001' },
            { name: 'dailyRate', label: 'Diária (R$)', placeholder: 'Ex: 850' },
            { name: 'purchasePrice', label: 'Valor de Aquisição (R$)', placeholder: 'Ex: 450000' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-300 mb-1">{field.label}</label>
              <input
                name={field.name}
                value={(form as any)[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                className="w-full px-4 py-2.5 rounded-lg border text-white outline-none focus:border-blue-500 transition-colors"
                style={{ backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Categoria</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-lg border text-white outline-none focus:border-blue-500 transition-colors"
              style={{ backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }}
            >
              <option value="">Selecione...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Ano</label>
            <input
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              min={1900}
              max={new Date().getFullYear() + 1}
              required
              className="w-full px-4 py-2.5 rounded-lg border text-white outline-none focus:border-blue-500 transition-colors"
              style={{ backgroundColor: '#0f172a', borderColor: 'var(--card-border)' }}
            />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#450a0a', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard"
            className="flex-1 py-2.5 rounded-lg text-center text-sm font-medium transition-colors"
            style={{ backgroundColor: '#1e293b', color: 'var(--muted)' }}>
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}>
            {loading ? 'Salvando...' : 'Cadastrar Veículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
