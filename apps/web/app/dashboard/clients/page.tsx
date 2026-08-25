'use client'

import { useEffect, useState, useMemo } from 'react'
import api from '@/lib/api'
import { Users, Plus, X, Phone, Mail, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react'

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 13) return `+${digits.slice(0,2)} (${digits.slice(2,4)}) ${digits.slice(4,9)}-${digits.slice(9)}`
  if (digits.length === 12) return `+${digits.slice(0,2)} (${digits.slice(2,4)}) ${digits.slice(4,8)}-${digits.slice(8)}`
  if (digits.length === 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  if (digits.length === 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
  return phone
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
  if (digits.length <= 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
  return `+${digits.slice(0,2)} (${digits.slice(2,4)}) ${digits.slice(4,9)}-${digits.slice(9,13)}`
}

const PAGE_SIZE = 12

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', document: '' })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  async function fetchClients() {
    try {
      const { data } = await api.get('/clients')
      setClients(data.items || data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClients() }, [])
  useEffect(() => { setPage(1) }, [search])

  const filtered = useMemo(() => {
    if (!search) return clients
    const q = search.toLowerCase()
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.document || '').includes(q)
    )
  }, [clients, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
          <p style={{ color: 'var(--muted)' }}>
            {filtered.length} de {clients.length} clientes
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--primary)' }}>
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, email, telefone ou documento..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-white outline-none"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }} />
      </div>

      {loading ? (
        <div className="text-white">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-white mb-1">
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </p>
          {!search && <p className="text-sm">Clique em "Novo Cliente" para comecar</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map(c => (
              <div key={c.id} className="p-5 rounded-xl border"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: 'var(--primary)' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate">{c.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                      <Phone size={14} className="shrink-0" />
                      <span>{formatPhone(c.phone)}</span>
                    </div>
                  )}
                  {c.document && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                      <FileText size={14} className="shrink-0" />
                      <span>{c.document}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors"
                style={{ color: 'var(--muted)' }}>
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-white">
                Pagina {page} de {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors"
                style={{ color: 'var(--muted)' }}>
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

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
                { label: 'Telefone', key: 'phone', placeholder: '(61) 99999-0000', mask: true },
                { label: 'CPF / CNPJ', key: 'document', placeholder: '000.000.000-00' },
              ].map(({ label, key, placeholder, mask }: any) => (
                <div key={key}>
                  <label className="text-sm font-medium text-white mb-2 block">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: mask ? maskPhone(e.target.value) : e.target.value }))}
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
