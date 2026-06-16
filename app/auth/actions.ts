'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthResult = {
  success: boolean
  error?: string
  data?: any
}

/**
 * Cadastra um novo usuário no sistema
 * 
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @param metadata - Metadados adicionais do usuário (nome, etc)
 * @returns Resultado da operação
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, any>
): Promise<AuthResult> {
  // Validação básica
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Email inválido',
    }
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      error: 'Senha deve ter no mínimo 6 caracteres',
    }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath('/', 'layout')
    
    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar conta',
    }
  }
}

/**
 * Faz login de um usuário existente
 * 
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @returns Resultado da operação
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  // Validação básica
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Email inválido',
    }
  }

  if (!password) {
    return {
      success: false,
      error: 'Senha é obrigatória',
    }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: 'Email ou senha incorretos',
      }
    }

    revalidatePath('/', 'layout')
    
    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer login',
    }
  }
}

/**
 * Faz logout do usuário atual
 * 
 * @returns Resultado da operação
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer logout',
    }
  }
}

/**
 * Envia email de recuperação de senha
 * 
 * @param email - Email do usuário
 * @returns Resultado da operação
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  // Validação básica
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Email inválido',
    }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: {
        message: 'Email de recuperação enviado',
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao enviar email',
    }
  }
}

/**
 * Atualiza a senha do usuário autenticado
 * 
 * @param newPassword - Nova senha
 * @returns Resultado da operação
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  // Validação básica
  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: 'Senha deve ter no mínimo 6 caracteres',
    }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath('/', 'layout')

    return {
      success: true,
      data: {
        user: data.user,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar senha',
    }
  }
}
