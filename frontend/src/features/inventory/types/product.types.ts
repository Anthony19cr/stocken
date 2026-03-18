export type StockStatus = 'OK' | 'LOW' | 'OUT' | 'OVERFLOW'

export interface Product {
  id: string
  name: string
  sku?: string | null
  categoryId: string
  categoryName?: string
  unitId: string
  unitSymbol?: string
  supplierId?: string | null
  supplierName?: string | null
  minimumStock: number
  maximumStock?: number | null
  tracksExpiration: boolean
  isActive: boolean
  notes?: string | null
  currentStock: number
  stockStatus: StockStatus
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: string
  isActive?: boolean
  lowStock?: boolean
}

export interface CreateProductData {
  name: string
  sku?: string
  categoryId: string
  unitId: string
  supplierId?: string
  minimumStock: number
  maximumStock?: number
  tracksExpiration?: boolean
  notes?: string
}