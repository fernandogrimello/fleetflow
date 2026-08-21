import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FleetFlow — Gestao de Frota',
  description: 'Sistema de gestao de frota de equipamentos para locacao',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
