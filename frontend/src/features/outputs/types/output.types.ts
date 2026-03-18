export type OutputReason = 'KITCHEN_USE' | 'WASTE' | 'EXPIRED' | 'ADJUSTMENT' | 'OTHER'

export const OUTPUT_REASON_LABELS: Record<OutputReason, string> = {
  KITCHEN_USE: 'Uso en cocina',
  WASTE: 'Desperdicio',
  EXPIRED: 'Vencimiento',
  ADJUSTMENT: 'Ajuste manual',
  OTHER: 'Otro',
}

export interface Output {
  id: string
  productId: string
  productName?: string
  quantity: number
  outputReason: OutputReason
  notes?: string | null
  performedById: string
  movementId: string | null
  outputDate: string
  createdAt: string
}

export interface CreateOutputData {
  productId: string
  quantity: number
  outputReason: OutputReason
  notes?: string
}