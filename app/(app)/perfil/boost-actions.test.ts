import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({ getAuthUser: vi.fn() }))
vi.mock('@/data/tekoin.service', () => ({ getTekoinService: vi.fn() }))
vi.mock('@/data/service.service', () => ({ getServiceService: vi.fn() }))
vi.mock('@/data/product.service', () => ({ getProductService: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { getAuthUser } from '@/lib/auth/session'
import { getTekoinService } from '@/data/tekoin.service'
import { getServiceService } from '@/data/service.service'
import { getProductService } from '@/data/product.service'
import { highlightListingAction, priorityListingAction } from './boost-actions'

const mockUser = { id: 'user-1', email: 'u1@test.com' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)
})

describe('highlightListingAction', () => {
  it('retorna erro se não autenticado', async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null)
    const res = await highlightListingAction({ serviceId: 'svc-1' })
    expect(res.success).toBe(false)
  })

  it('bloqueia se o usuário não é o dono do serviço', async () => {
    vi.mocked(getServiceService).mockReturnValue({
      getServiceById: vi.fn().mockResolvedValue({ success: true, data: { user_id: 'user-99' } }),
    } as any)

    const res = await highlightListingAction({ serviceId: 'svc-1' })
    expect(res.success).toBe(false)
  })

  it('destaca o serviço quando o usuário é o dono', async () => {
    vi.mocked(getServiceService).mockReturnValue({
      getServiceById: vi.fn().mockResolvedValue({ success: true, data: { user_id: 'user-1' } }),
    } as any)
    const spendOnBoost = vi.fn().mockResolvedValue({ success: true, data: {} })
    vi.mocked(getTekoinService).mockReturnValue({ spendOnBoost } as any)

    const res = await highlightListingAction({ serviceId: 'svc-1' })

    expect(res.success).toBe(true)
    expect(spendOnBoost).toHaveBeenCalledWith('user-1', 'highlight', { serviceId: 'svc-1' })
  })

  it('propaga erro de saldo insuficiente', async () => {
    vi.mocked(getServiceService).mockReturnValue({
      getServiceById: vi.fn().mockResolvedValue({ success: true, data: { user_id: 'user-1' } }),
    } as any)
    vi.mocked(getTekoinService).mockReturnValue({
      spendOnBoost: vi.fn().mockResolvedValue({ success: false, error: { message: 'Saldo de Tekoins insuficiente' } }),
    } as any)

    const res = await highlightListingAction({ serviceId: 'svc-1' })
    expect(res.success).toBe(false)
  })
})

describe('priorityListingAction', () => {
  it('bloqueia se o usuário não é o dono do produto', async () => {
    vi.mocked(getProductService).mockReturnValue({
      getProductById: vi.fn().mockResolvedValue({ success: true, data: { user_id: 'user-99' } }),
    } as any)

    const res = await priorityListingAction({ productId: 'prod-1' })
    expect(res.success).toBe(false)
  })

  it('prioriza o produto quando o usuário é o dono', async () => {
    vi.mocked(getProductService).mockReturnValue({
      getProductById: vi.fn().mockResolvedValue({ success: true, data: { user_id: 'user-1' } }),
    } as any)
    const spendOnBoost = vi.fn().mockResolvedValue({ success: true, data: {} })
    vi.mocked(getTekoinService).mockReturnValue({ spendOnBoost } as any)

    const res = await priorityListingAction({ productId: 'prod-1' })

    expect(res.success).toBe(true)
    expect(spendOnBoost).toHaveBeenCalledWith('user-1', 'priority', { productId: 'prod-1' })
  })

  it('retorna erro quando nenhum alvo é informado', async () => {
    const res = await priorityListingAction({})
    expect(res.success).toBe(false)
  })
})
