import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/messages
 * Envia uma mensagem em um chat (usa admin client pra bypass RLS)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId, content } = await req.json()

    if (!chatId || !content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid chatId/content' },
        { status: 400 }
      )
    }

    // Usar admin client já que autenticação foi verificada
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        content,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/messages] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[POST /api/messages] Exception:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
