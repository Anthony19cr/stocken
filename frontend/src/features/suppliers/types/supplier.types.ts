export interface Supplier {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  notes?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierData {
  name: string
  phone?: string
  email?: string
  notes?: string
}