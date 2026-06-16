/**
 * Categorias compartilhadas pela plataforma.
 * Mantidas em um só lugar para Trocas, Feira e filtros.
 */

export interface Category {
  value: string
  label: string
}

/** Categorias de serviços (Trocas). */
export const SERVICE_CATEGORIES: Category[] = [
  { value: 'reparos', label: 'Reparos e manutenção' },
  { value: 'aulas', label: 'Aulas e reforço' },
  { value: 'cuidados', label: 'Cuidados e saúde' },
  { value: 'beleza', label: 'Beleza e bem-estar' },
  { value: 'cozinha', label: 'Cozinha e alimentação' },
  { value: 'transporte', label: 'Transporte e fretes' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'arte', label: 'Arte e cultura' },
  { value: 'roca', label: 'Roça e plantio' },
  { value: 'outros', label: 'Outros' },
]

/** Categorias de produtos (Feira do Rolo). */
export const PRODUCT_CATEGORIES: Category[] = [
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'vestuario', label: 'Vestuário' },
  { value: 'moveis', label: 'Móveis' },
  { value: 'utensilios', label: 'Utensílios' },
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'infantil', label: 'Infantil' },
  { value: 'outros', label: 'Outros' },
]

export function categoryLabel(list: Category[], value: string): string {
  return list.find((c) => c.value === value)?.label ?? value
}
