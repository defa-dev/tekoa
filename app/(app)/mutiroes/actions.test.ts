import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({ getAuthUser: vi.fn(), getCurrentProfile: vi.fn() }))
vi.mock('@/data/mutirao.service', () => ({ getMutiraoService: vi.fn() }))
vi.mock('@/data/mutirao-message.service', () => ({ getMutiraoMessageService: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { getAuthUser, getCurrentProfile } from '@/lib/auth/session'
import { getMutiraoService } from '@/data/mutirao.service'
import { getMutiraoMessageService } from '@/data/mutirao-message.service'
import {
  createMutiraoAction,
  confirmAttendanceAction,
  cancelMutiraoAction,
  sendMutiraoMessageAction,
} from './actions'

const mockUser = { id: 'user-1', email: 'u1@test.com' }
const mockProfile = { id: 'user-1', location: 'Massaguaçu' }
const mockMutirao = { id: 'mut-1', organizer_id: 'user-1' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAuthUser).mockResolvedValue(mockUser as any)
  vi.mocked(getCurrentProfile).mockResolvedValue(mockProfile as any)
})

describe('createMutiraoAction', () => {
  it('retorna erro se não autenticado', async () => {
    vi.mocked(getCurrentProfile).mockResolvedValue(null)
    const res = await createMutiraoAction({ title: 'T', description: 'D', minConfirmations: 2 })
    expect(res.success).toBe(false)
  })

  it('cria o mutirão com o organizador da sessão e o território dele', async () => {
    const createMutirao = vi.fn().mockResolvedValue({ success: true, data: { id: 'mut-1' } })
    vi.mocked(getMutiraoService).mockReturnValue({ createMutirao } as any)

    const res = await createMutiraoAction({ title: 'T', description: 'D', minConfirmations: 2 })

    expect(res.success).toBe(true)
    expect(createMutirao).toHaveBeenCalledWith('user-1', {
      title: 'T',
      description: 'D',
      minConfirmations: 2,
      community: 'Massaguaçu',
    })
  })
})

describe('confirmAttendanceAction', () => {
  it('confirma presença do usuário da sessão', async () => {
    const confirmAttendance = vi.fn().mockResolvedValue({ success: true, data: {} })
    vi.mocked(getMutiraoService).mockReturnValue({ confirmAttendance } as any)

    const res = await confirmAttendanceAction('mut-1')

    expect(res.success).toBe(true)
    expect(confirmAttendance).toHaveBeenCalledWith('mut-1', 'user-1')
  })
})

describe('cancelMutiraoAction', () => {
  it('propaga erro quando o service bloqueia', async () => {
    vi.mocked(getMutiraoService).mockReturnValue({
      cancelMutirao: vi.fn().mockResolvedValue({ success: false, error: { message: 'Só o organizador pode cancelar' } }),
    } as any)

    const res = await cancelMutiraoAction('mut-1')
    expect(res.success).toBe(false)
  })
})

describe('sendMutiraoMessageAction', () => {
  it('permite o organizador enviar mensagem', async () => {
    const sendMessage = vi.fn().mockResolvedValue({ success: true, data: {} })
    vi.mocked(getMutiraoService).mockReturnValue({
      getMutiraoById: vi.fn().mockResolvedValue({ success: true, data: mockMutirao }),
    } as any)
    vi.mocked(getMutiraoMessageService).mockReturnValue({ sendMessage } as any)

    const res = await sendMutiraoMessageAction('mut-1', 'Oi gente')

    expect(res.success).toBe(true)
    expect(sendMessage).toHaveBeenCalledWith('mut-1', 'user-1', 'Oi gente')
  })

  it('bloqueia quem não é organizador nem confirmado', async () => {
    vi.mocked(getMutiraoService).mockReturnValue({
      getMutiraoById: vi.fn().mockResolvedValue({ success: true, data: { id: 'mut-1', organizer_id: 'outro' } }),
      getConfirmations: vi.fn().mockResolvedValue({ success: true, data: [] }),
    } as any)

    const res = await sendMutiraoMessageAction('mut-1', 'Oi gente')

    expect(res.success).toBe(false)
  })

  it('permite confirmado (não organizador) enviar mensagem', async () => {
    const sendMessage = vi.fn().mockResolvedValue({ success: true, data: {} })
    vi.mocked(getMutiraoService).mockReturnValue({
      getMutiraoById: vi.fn().mockResolvedValue({ success: true, data: { id: 'mut-1', organizer_id: 'outro' } }),
      getConfirmations: vi.fn().mockResolvedValue({ success: true, data: [{ user_id: 'user-1' }] }),
    } as any)
    vi.mocked(getMutiraoMessageService).mockReturnValue({ sendMessage } as any)

    const res = await sendMutiraoMessageAction('mut-1', 'Oi gente')

    expect(res.success).toBe(true)
  })
})
