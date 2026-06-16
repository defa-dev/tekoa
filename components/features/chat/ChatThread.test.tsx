import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatThread } from './ChatThread'
import type { Message } from '@/types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), back: vi.fn() }),
}))

vi.mock('@/components/features/ratings/RatingSheet', () => ({
  RatingSheet: ({ toUserName }: { toUserName: string }) => (
    <button type="button">Avaliar</button>
  ),
}))

vi.mock('@/components/features/chat/TradeCloseSheet', () => ({
  TradeCloseSheet: () => <button type="button">Encerrar troca</button>,
}))

// Mock EventSource
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

describe('ChatThread', () => {
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      chat_id: 'chat-1',
      sender_id: 'user-2',
      content: 'Olá!',
      read: true,
      created_at: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    MockEventSource.instances = []
    global.EventSource = MockEventSource as unknown as typeof EventSource
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deve renderizar mensagens iniciais', () => {
    render(
      <ChatThread
        chatId="chat-1"
        currentUserId="user-1"
        initialMessages={mockMessages}
      />
    )

    expect(screen.getByText('Olá!')).toBeInTheDocument()
  })

  it('deve enviar uma mensagem com sucesso', async () => {
    const user = userEvent.setup()

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'msg-2',
          chat_id: 'chat-1',
          sender_id: 'user-1',
          content: 'Oi!',
          read: false,
          created_at: new Date().toISOString(),
        }),
    } as any)

    const { container } = render(
      <ChatThread
        chatId="chat-1"
        currentUserId="user-1"
        initialMessages={mockMessages}
      />
    )

    const input = screen.getByPlaceholderText('Escreva uma mensagem...')

    await user.type(input, 'Oi!')
    const form = input.closest('form')
    if (!form) throw new Error('Form not found')

    fireEvent.submit(form)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: 'chat-1', content: 'Oi!' }),
      })
    })
  })

  it('deve conectar via SSE e exibir mensagem recebida', async () => {
    render(
      <ChatThread
        chatId="chat-1"
        currentUserId="user-1"
        initialMessages={mockMessages}
      />
    )

    // Verifica que EventSource foi criado com a URL correta
    expect(MockEventSource.instances).toHaveLength(1)
    expect(MockEventSource.instances[0].url).toBe('/api/messages/chat-1/stream')

    const newMsg: Message = {
      id: 'msg-2',
      chat_id: 'chat-1',
      sender_id: 'user-2',
      content: 'Mensagem via SSE',
      read: false,
      created_at: new Date().toISOString(),
    }

    // Simula chegada de mensagem pelo SSE
    await act(async () => {
      MockEventSource.instances[0].emit(newMsg)
    })

    expect(screen.getByText('Mensagem via SSE')).toBeInTheDocument()
  })

  it('deve não enviar mensagem se texto vazio', async () => {
    const user = userEvent.setup()

    render(
      <ChatThread
        chatId="chat-1"
        currentUserId="user-1"
        initialMessages={mockMessages}
      />
    )

    const form = screen.getByPlaceholderText('Escreva uma mensagem...').closest('form')
    if (!form) throw new Error('Form not found')

    fireEvent.submit(form)

    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('deve renderizar disclaimer pendente para interesse', () => {
    render(
      <ChatThread
        chatId="chat-1"
        currentUserId="user-1"
        initialMessages={mockMessages}
        chatStatus="pending"
        initiatedBy="user-1"
        serviceId="svc-1"
      />
    )

    expect(
      screen.getByText(/Interesse enviado — aguardando resposta/)
    ).toBeInTheDocument()
  })

  it('deve renderizar disclaimer declinado', () => {
    render(
      <ChatThread
        chatId="chat-1"
        currentUserId="user-1"
        initialMessages={mockMessages}
        chatStatus="declined"
        serviceId="svc-1"
      />
    )

    expect(
      screen.getByText(/Este interesse foi recusado/)
    ).toBeInTheDocument()
  })

  describe('ciclo de encerramento', () => {
    it('exibe botão "Encerrar troca" em chat active de serviço', () => {
      render(
        <ChatThread
          chatId="chat-1"
          currentUserId="user-1"
          initialMessages={mockMessages}
          chatStatus="active"
          serviceId="svc-1"
          otherUserId="user-2"
          otherUserName="Maria"
        />
      )
      expect(screen.getByText('Encerrar troca')).toBeInTheDocument()
    })

    it('não exibe botão "Encerrar troca" em chat sem serviceId', () => {
      render(
        <ChatThread
          chatId="chat-1"
          currentUserId="user-1"
          initialMessages={mockMessages}
          chatStatus="active"
        />
      )
      expect(screen.queryByText('Encerrar troca')).not.toBeInTheDocument()
    })

    it('exibe banner de troca encerrada quando status é completed', () => {
      render(
        <ChatThread
          chatId="chat-1"
          currentUserId="user-1"
          initialMessages={mockMessages}
          chatStatus="completed"
          serviceId="svc-1"
          otherUserId="user-2"
          otherUserName="Maria"
        />
      )
      expect(screen.getByText(/Troca encerrada/)).toBeInTheDocument()
    })

    it('não permite enviar mensagem quando chat está completed', () => {
      render(
        <ChatThread
          chatId="chat-1"
          currentUserId="user-1"
          initialMessages={mockMessages}
          chatStatus="completed"
          serviceId="svc-1"
        />
      )
      expect(screen.queryByPlaceholderText('Escreva uma mensagem...')).not.toBeInTheDocument()
    })

    it('exibe botão Avaliar no banner de troca encerrada', () => {
      render(
        <ChatThread
          chatId="chat-1"
          currentUserId="user-1"
          initialMessages={mockMessages}
          chatStatus="completed"
          serviceId="svc-1"
          otherUserId="user-2"
          otherUserName="Maria"
        />
      )
      expect(screen.getByText('Avaliar')).toBeInTheDocument()
    })
  })
})
