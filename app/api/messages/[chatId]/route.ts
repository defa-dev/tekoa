import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/messages/[chatId]
 * Busca as mensagens de um chat (usa admin client pra bypass RLS)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = await params

    // Usar admin client já que autenticação foi verificada
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      console.error('[GET /api/messages/[chatId]] Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[GET /api/messages/[chatId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/messages/[chatId]
 * Marca um chat como lido (usa admin client pra bypass RLS)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = await params

    // Usar admin client já que autenticação foi verificada
    const adminClient = createAdminClient()
    await adminClient
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/messages/[chatId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
