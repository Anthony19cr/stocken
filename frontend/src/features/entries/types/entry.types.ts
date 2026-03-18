export interface Entry {
  id: string
  productId: string
  productName?: string
  supplierId?: string | null
  supplierName?: string | null
  quantity: number
  unitCost?: number | null
  expirationDate?: string | null
  notes?: string | null
  performedById: string
  movementId: string | null
  entryDate: string
  createdAt: string
}

export interface CreateEntryData {
  productId: string
  supplierId?: string
  quantity: number
  unitCost?: number
  expirationDate?: string
  notes?: string
}