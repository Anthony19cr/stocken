import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  sku: z.string().regex(/^[A-Z0-9-]+$/, 'Solo mayúsculas, números y guiones').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  unitId: z.string().min(1, 'Selecciona una unidad'),
  supplierId: z.string().optional().or(z.literal('')),
  minimumStock: z.coerce.number().min(0, 'No puede ser negativo'),
  maximumStock: z.coerce.number().min(0).optional().or(z.literal('')),
  tracksExpiration: z.boolean().default(false),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type ProductFormValues = z.infer<typeof productSchema>