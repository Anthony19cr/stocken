import type { StockStatus } from '../types/product.types'

const statusConfig: Record<StockStatus, { label: string; className: string }> = {
  OK: { label: 'Normal', className: 'bg-green-100 text-green-700' },
  LOW: { label: 'Bajo', className: 'bg-yellow-100 text-yellow-700' },
  OUT: { label: 'Agotado', className: 'bg-red-100 text-red-700' },
  OVERFLOW: { label: 'Exceso', className: 'bg-blue-100 text-blue-700' },
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const { label, className } = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}