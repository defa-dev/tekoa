import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatThread } from './ChatThread'
import type { Message } from '@/types'

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
    // Mock fetch
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

    const input = container.querySelector('input[type="text"]')
    if (!input) throw new Error('Input not found')

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

  it('deve fazer polling a cada 2 segundos', async () => {
    vi.useFakeTimers()

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMessages),
    } as any)

    render(
      <ChatThread
        chatId="chat-1"
        currentUserId="user-1"
        initialMessages={mockMessages}
      />
    )

    // Aguarda primeira chamada
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/messages/chat-1')
    })

    const firstCallCount = vi.mocked(global.fetch).mock.calls.length

    // Avança 2 segundos
    vi.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(vi.mocked(global.fetch).mock.calls.length).toBeGreaterThan(
        firstCallCount
      )
    })

    vi.useRealTimers()
  })

  it('deve não enviar mensagem se texto vazio', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <ChatThread
        chatId="chat-1"
        currentUserId="user-1"
        initialMessages={mockMessages}
      />
    )

    const form = container.querySelector('form')
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
})
