import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/admin', () => ({ ensureAdmin: vi.fn() }))
vi.mock('@/lib/auth/session', () => ({ getCurrentProfile: vi.fn() }))
vi.mock('@/data/community-admin.service', () => ({ getCommunityAdminService: vi.fn() }))
vi.mock('@/data/user.service', () => ({ getUserService: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { ensureAdmin } from '@/lib/auth/admin'
import { getCurrentProfile } from '@/lib/auth/session'
import { getCommunityAdminService } from '@/data/community-admin.service'
import { getUserService } from '@/data/user.service'
import { assignCommunityAdminAction } from './community-admins-actions'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('assignCommunityAdminAction', () => {
  it('bloqueia quem não é admin da plataforma', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(false)

    const res = await assignCommunityAdminAction('c-1', 'maria@tekoa.test')

    expect(res.success).toBe(false)
  })

  it('retorna erro se o e-mail não corresponde a nenhum usuário', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(true)
    vi.mocked(getCurrentProfile).mockResolvedValue({ id: 'admin-1' } as any)
    vi.mocked(getUserService).mockReturnValue({
      getUserByEmail: vi.fn().mockResolvedValue({ success: true, data: null }),
    } as any)

    const res = await assignCommunityAdminAction('c-1', 'ninguem@tekoa.test')

    expect(res.success).toBe(false)
  })

  it('atribui o admin quando tudo é válido', async () => {
    vi.mocked(ensureAdmin).mockResolvedValue(true)
    vi.mocked(getCurrentProfile).mockResolvedValue({ id: 'admin-1' } as any)
    vi.mocked(getUserService).mockReturnValue({
      getUserByEmail: vi.fn().mockResolvedValue({ success: true, data: { id: 'user-2' } }),
    } as any)
    const assignAdmin = vi.fn().mockResolvedValue({ success: true, data: {} })
    vi.mocked(getCommunityAdminService).mockReturnValue({ assignAdmin } as any)

    const res = await assignCommunityAdminAction('c-1', 'maria@tekoa.test')

    expect(res.success).toBe(true)
    expect(assignAdmin).toHaveBeenCalledWith('c-1', 'user-2', 'admin-1')
  })
})
