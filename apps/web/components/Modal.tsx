'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={`relative w-full ${widths[size]} rounded-2xl border shadow-2xl`}
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-700 transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
