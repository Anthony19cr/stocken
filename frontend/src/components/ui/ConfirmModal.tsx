import { X, AlertTriangle } from 'lucide-react'
import { createPortal } from 'react-dom'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
  isPending?: boolean
  variant?: 'danger' | 'warning'
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onClose,
  isPending,
  variant = 'danger',
}: Props) {
  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div
        className="fixed z-50 bg-white rounded-2xl shadow-xl flex flex-col"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '384px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-4 flex-shrink-0">
          <div className={`flex items-start gap-3 p-3 rounded-lg mb-4
            ${variant === 'danger' ? 'bg-red-50' : 'bg-yellow-50'}`}>
            <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5
              ${variant === 'danger' ? 'text-red-500' : 'text-yellow-500'}`} />
            <p className="text-sm text-gray-700">{message}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={`flex-1 py-2 px-4 text-white text-sm font-medium rounded-lg transition-colors
                ${variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                  : 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400'
                }`}
            >
              {isPending ? 'Procesando...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}