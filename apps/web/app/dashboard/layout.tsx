'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, removeToken } from '@/lib/auth'
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  BarChart3,
  Shield,
  DollarSign,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Painel de Frota', icon: LayoutDashboard },
  { href: '/dashboard/rentals', label: 'Locacoes', icon: ClipboardList },
  { href: '/dashboard/maintenance', label: 'Manutencao', icon: Wrench },
  { href: '/dashboard/financial', label: 'Financeiro', icon: DollarSign },
  { href: '/dashboard/metrics', label: 'Metricas', icon: BarChart3 },
  { href: '/dashboard/insurance', label: 'Seguros', icon: Shield },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login')
  }, [router])

  function handleLogout() {
    removeToken()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r transition-transform duration-300 lg:translate-x-0 lg:static lg:flex ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <h1 className="text-xl font-bold text-white">FleetFlow</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Gestao de Frota</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'var(--primary)' : 'transparent',
                  color: active ? 'white' : 'var(--muted)',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full transition-colors hover:text-white"
            style={{ color: 'var(--muted)' }}
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 border-b" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-white">FleetFlow</h1>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
