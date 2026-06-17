import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { NotificationWatcher } from './NotificationWatcher'

const refresh = vi.fn()
const toast = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ toast }),
}))

class MockEventSource {
  static instances: MockEventSource[] = []
  url: string
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  close = vi.fn()

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  emit(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent)
  }
}

function baseChat(overrides: Record<string, unknown> = {}) {
  return {
    id: 'chat-1',
    status: 'active',
    participant_1: 'user-1',
    participant_2: 'user-2',
    initiated_by: null,
    last_message_at: '2026-01-01T00:00:00Z',
    last_sender_id: null,
    service_id: null,
    product_id: null,
    ...overrides,
  }
}

function emitEvent(
  type: 'INSERT' | 'UPDATE' | 'DELETE',
  chat: Record<string, unknown>,
  serviceType: 'offer' | 'request' | null = null
) {
  MockEventSource.instances[0].emit({ type, chat, serviceType })
}

describe('NotificationWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    MockEventSource.instances = []
    global.EventSource = MockEventSource as unknown as typeof EventSource
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('avisa sobre novo interesse numa oferta', async () => {
    render(<NotificationWatcher userId="user-2" />)
    await act(async () => {
      emitEvent(
        'INSERT',
        baseChat({ status: 'pending', last_message_at: null, service_id: 'svc-1' }),
        'offer'
      )
    })
    expect(toast).toHaveBeenCalledWith('Novo interesse na sua oferta!', 'info')
    expect(refresh).toHaveBeenCalled()
  })

  it('avisa diferente quando alguém aparece pra ajudar numa busca', async () => {
    render(<NotificationWatcher userId="user-2" />)
    await act(async () => {
      emitEvent(
        'INSERT',
        baseChat({ status: 'pending', last_message_at: null, service_id: 'svc-1' }),
        'request'
      )
    })
    expect(toast).toHaveBeenCalledWith('Alguém apareceu pra ajudar na sua busca!', 'info')
  })

  it('avisa sobre nova proposta de negociação de produto', async () => {
    render(<NotificationWatcher userId="user-2" />)
    await act(async () => {
      emitEvent('INSERT', baseChat({ last_message_at: null, product_id: 'prod-1' }))
    })
    expect(toast).toHaveBeenCalledWith('Nova proposta de negociação recebida!', 'info')
    expect(refresh).toHaveBeenCalled()
  })

  it('avisa quem demonstrou interesse que foi aceito', async () => {
    render(<NotificationWatcher userId="user-1" />)
    await act(async () => {
      emitEvent('UPDATE', baseChat({ status: 'active', last_message_at: null }))
    })
    expect(toast).toHaveBeenCalledWith('Seu interesse foi aceito! Vamos combinar.', 'sucesso')
  })

  it('avisa sobre mensagem recebida de outra pessoa', async () => {
    render(<NotificationWatcher userId="user-2" />)
    await act(async () => {
      emitEvent('UPDATE', baseChat({ last_sender_id: 'user-1' }))
    })
    expect(toast).toHaveBeenCalledWith('Mensagem recebida!', 'info')
    expect(refresh).toHaveBeenCalled()
  })

  it('não avisa sobre a própria mensagem', async () => {
    render(<NotificationWatcher userId="user-1" />)
    await act(async () => {
      emitEvent(
        'UPDATE',
        // participant_1 trocado pra não cair no branch de "interesse aceito"
        baseChat({ participant_1: 'user-2', participant_2: 'user-1', last_sender_id: 'user-1' })
      )
    })
    expect(toast).not.toHaveBeenCalled()
  })

  it('não repete aviso pra mesma mensagem (dedup por last_message_at)', async () => {
    render(<NotificationWatcher userId="user-2" />)
    const chat = baseChat({ last_sender_id: 'user-1', last_message_at: '2026-01-01T10:00:00Z' })
    await act(async () => {
      emitEvent('UPDATE', chat)
      emitEvent('UPDATE', chat)
    })
    expect(toast).toHaveBeenCalledTimes(1)
  })

  it('uma segunda mensagem no mesmo chat ainda dispara novo aviso', async () => {
    render(<NotificationWatcher userId="user-2" />)
    await act(async () => {
      emitEvent(
        'UPDATE',
        baseChat({ last_sender_id: 'user-1', last_message_at: '2026-01-01T10:00:00Z' })
      )
      emitEvent(
        'UPDATE',
        baseChat({ last_sender_id: 'user-1', last_message_at: '2026-01-01T10:05:00Z' })
      )
    })
    expect(toast).toHaveBeenCalledTimes(2)
  })

  it('não repete toast pra mensagem automática da 1ª proposta de negociação', async () => {
    render(<NotificationWatcher userId="user-2" />)
    await act(async () => {
      // 1) chat criado (proposta)
      emitEvent('INSERT', baseChat({ last_message_at: null, product_id: 'prod-1' }))
      // 2) intro automática chega como UPDATE no mesmo chat
      emitEvent(
        'UPDATE',
        baseChat({
          product_id: 'prod-1',
          last_sender_id: 'user-1',
          last_message_at: '2026-01-01T10:00:00Z',
        })
      )
    })
    expect(toast).toHaveBeenCalledTimes(1)
    expect(toast).toHaveBeenCalledWith('Nova proposta de negociação recebida!', 'info')
  })

  it('mensagens seguintes na mesma negociação voltam a notificar normalmente', async () => {
    render(<NotificationWatcher userId="user-2" />)
    await act(async () => {
      emitEvent('INSERT', baseChat({ last_message_at: null, product_id: 'prod-1' }))
      emitEvent(
        'UPDATE',
        baseChat({
          product_id: 'prod-1',
          last_sender_id: 'user-1',
          last_message_at: '2026-01-01T10:00:00Z',
        })
      )
      emitEvent(
        'UPDATE',
        baseChat({
          product_id: 'prod-1',
          last_sender_id: 'user-1',
          last_message_at: '2026-01-01T10:05:00Z',
        })
      )
    })
    expect(toast).toHaveBeenCalledTimes(2)
    expect(toast).toHaveBeenLastCalledWith('Mensagem recebida!', 'info')
  })
})
