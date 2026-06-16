export const dynamic = 'force-dynamic'

import { getAuthUser } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const user = await getAuthUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const userId = user.id

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder()
      const send = (data: object) => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {}
      }

      const admin = createAdminClient()

      const handleChange = (payload: { eventType: string; new: Record<string, unknown> }) => {
        send({ type: payload.eventType, chat: payload.new })
      }

      // Two channels — user can be in either participant column
      const ch1 = admin
        .channel(`notif-p1-${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chats', filter: `participant_1=eq.${userId}` },
          handleChange
        )
        .subscribe()

      const ch2 = admin
        .channel(`notif-p2-${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chats', filter: `participant_2=eq.${userId}` },
          handleChange
        )
        .subscribe()

      req.signal.addEventListener('abort', () => {
        admin.removeChannel(ch1)
        admin.removeChannel(ch2)
        try {
          controller.close()
        } catch {}
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
