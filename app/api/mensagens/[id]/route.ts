import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth, canAccessConsulta } from '@/lib/auth/permissions'
import { mensagemUpdateSchema, idParamSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/mensagens/[id] - Buscar mensagem por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['mensagens:read'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse({ id: params.id })
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da mensagem inválido.'
        },
        { status: 400 }
      )
    }
    
    const { id } = idValidation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar mensagem com dados da conversa e consulta
    const { data: mensagem, error } = await supabase
      .from('mensagens')
      .select(`
        id,
        conversa_id,
        conteudo,
        remetente_tipo,
        remetente_id,
        lida,
        created_at,
        updated_at,
        conversas!inner(
          id,
          consulta_id,
          paciente_id,
          medico_id,
          ativa,
          consultas!inner(
            id,
            paciente_id,
            medico_id,
            clinica_id,
            status
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error || !mensagem) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Mensagem não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta mensagem
    if (!await canAccessConsulta(user, mensagem.conversas[0].consulta_id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar esta mensagem.'
        },
        { status: 403 }
      )
    }
    
    // Se o usuário é o destinatário da mensagem, marcar como lida
    if (!mensagem.lida) {
      let shouldMarkAsRead = false
      
      if (mensagem.remetente_tipo === 'paciente' && user.role === 'medico' && 
          user.id === mensagem.conversas[0].medico_id) {
        shouldMarkAsRead = true
      } else if (mensagem.remetente_tipo === 'medico' && 
                 user.role === 'admin' || user.role === 'super_admin') {
        shouldMarkAsRead = true
      }
      
      if (shouldMarkAsRead) {
        const { error: updateError } = await supabase
          .from('mensagens')
          .update({ lida: true })
          .eq('id', id)
        
        if (!updateError) {
          mensagem.lida = true
        }
      }
    }
    
    return NextResponse.json({ data: mensagem })
    
  } catch (error) {
    console.error('Erro inesperado ao buscar mensagem:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// PUT /api/mensagens/[id] - Atualizar mensagem
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['mensagens:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse({ id: params.id })
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da mensagem inválido.'
        },
        { status: 400 }
      )
    }
    
    const { id } = idValidation.data
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = mensagemUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          message: 'Dados inválidos.',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }
    
    const updateData = validation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar mensagem atual
    const { data: mensagem, error: fetchError } = await supabase
      .from('mensagens')
      .select(`
        id,
        conversa_id,
        conteudo,
        remetente_tipo,
        remetente_id,
        lida,
        created_at,
        conversas!inner(
          id,
          consulta_id,
          paciente_id,
          medico_id,
          ativa,
          consultas!inner(
            id,
            paciente_id,
            medico_id,
            clinica_id,
            status
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (fetchError || !mensagem) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Mensagem não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta mensagem
    if (!await canAccessConsulta(user, mensagem.conversas[0].consulta_id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar esta mensagem.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se o usuário pode editar esta mensagem
    let canEdit = false
    
    // Apenas o remetente original ou admins podem editar
    if (user.role === 'admin' || user.role === 'super_admin') {
      canEdit = true
    } else if (mensagem.remetente_tipo === 'medico' && 
               user.role === 'medico' && 
               user.id === mensagem.remetente_id) {
      canEdit = true
    }
    
    if (!canEdit) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para editar esta mensagem.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se a conversa ainda está ativa (para edições de conteúdo)
    if (updateData.conteudo && !mensagem.conversas[0].ativa) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Não é possível editar mensagens em conversas inativas.'
        },
        { status: 409 }
      )
    }
    
    // Atualizar mensagem
    const { data: updatedMensagem, error: updateError } = await supabase
      .from('mensagens')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        conversa_id,
        conteudo,
        remetente_tipo,
        remetente_id,
        lida,
        created_at,
        updated_at
      `)
      .single()
    
    if (updateError) {
      console.error('Erro ao atualizar mensagem:', updateError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao atualizar mensagem.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Mensagem atualizada com sucesso.',
      data: updatedMensagem
    })
    
  } catch (error) {
    console.error('Erro inesperado na atualização de mensagem:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          message: 'Dados inválidos.',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/mensagens/[id] - Deletar mensagem
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['mensagens:delete'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse({ id: params.id })
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da mensagem inválido.'
        },
        { status: 400 }
      )
    }
    
    const { id } = idValidation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar mensagem
    const { data: mensagem, error: fetchError } = await supabase
      .from('mensagens')
      .select(`
        id,
        conversa_id,
        remetente_tipo,
        remetente_id,
        created_at,
        conversas!inner(
          id,
          consulta_id,
          paciente_id,
          medico_id,
          ativa,
          consultas!inner(
            id,
            paciente_id,
            medico_id,
            clinica_id,
            status
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (fetchError || !mensagem) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Mensagem não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta mensagem
    if (!await canAccessConsulta(user, mensagem.conversas[0].consulta_id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar esta mensagem.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se o usuário pode deletar esta mensagem
    let canDelete = false
    
    // Apenas o remetente original ou admins podem deletar
    if (user.role === 'admin' || user.role === 'super_admin') {
      canDelete = true
    } else if (mensagem.remetente_tipo === 'medico' && 
               user.role === 'medico' && 
               user.id === mensagem.remetente_id) {
      canDelete = true
    }
    
    if (!canDelete) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para deletar esta mensagem.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se a mensagem pode ser deletada (não muito antiga)
    const messageAge = Date.now() - new Date(mensagem.created_at).getTime()
    const maxEditTime = 24 * 60 * 60 * 1000 // 24 horas
    
    if (messageAge > maxEditTime && user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Mensagens antigas não podem ser deletadas.'
        },
        { status: 409 }
      )
    }
    
    // Deletar mensagem
    const { error: deleteError } = await supabase
      .from('mensagens')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Erro ao deletar mensagem:', deleteError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao deletar mensagem.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Mensagem deletada com sucesso.'
    })
    
  } catch (error) {
    console.error('Erro inesperado ao deletar mensagem:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}