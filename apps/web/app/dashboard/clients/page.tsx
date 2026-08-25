'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Users, Plus, X, Phone, Mail, FileText } from 'lucide-react'

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', document: '' })

  async function fetchClients() {
    try {
      const { data } = await api.get('/clients')
      setClients(data.items || data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClients() }, [])

  async function handleSubmit() {
    if (!form.name || !form.email) {
      alert('Nome e email sao obrigatorios')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/clients', form)
      setShowForm(false)
      setForm({ name: '', email: '', phone: '', document: '' })
      await fetchClients()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cadastrar cliente')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p style={{ color: 'var(--muted)' }}>{clients.length} clientes cadastrados</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--primary)' }}>
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {loading ? (
        <div className="text-white">Carregando...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-white mb-1">Nenhum cliente cadastrado</p>
          <p className="text-sm">Clique em "Novo Cliente" para comecar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => (
            <div key={c.id} className="p-5 rounded-xl border"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: 'var(--primary)' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold">{c.name}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                  <Mail size={14} />
                  <span className="truncate">{c.email}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                    <Phone size={14} />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.document && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                    <FileText size={14} />
                    <span>{c.document}</span>
                  </div>
                )}
              </div>
              {c.rentals && (
                <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
                  {c.rentals.length} locacao(oes)
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de cadastro */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: 'var(--card)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Novo Cliente</h2>
              <button onClick={() => setShowForm(false)} style={{ color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Nome *', key: 'name', placeholder: 'Nome completo ou razao social' },
                { label: 'Email *', key: 'email', placeholder: 'email@empresa.com.br' },
                { label: 'Telefone', key: 'phone', placeholder: '(61) 99999-0000' },
                { label: 'CPF / CNPJ', key: 'document', placeholder: '000.000.000-00' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-white mb-2 block">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl text-white outline-none"
                    style={{ backgroundColor: '#0f172a', border: '1px solid var(--card-border)' }}
                  />
                </div>
              ))}
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}>
                {submitting ? 'Cadastrando...' : 'Cadastrar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
