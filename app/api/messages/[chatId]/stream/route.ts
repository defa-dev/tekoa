import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/messages/[chatId]/stream
 * SSE: abre conexão persistente e envia novas mensagens via Supabase Realtime.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const user = await getAuthUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { chatId } = await params

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder()
      const send = (data: unknown) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`))

      const adminClient = createAdminClient()

      const channel = adminClient
        .channel(`chat-messages-${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => send(payload.new)
        )
        .subscribe()

      req.signal.addEventListener('abort', () => {
        adminClient.removeChannel(channel)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
