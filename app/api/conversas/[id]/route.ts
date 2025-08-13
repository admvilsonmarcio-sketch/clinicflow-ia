import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth, canAccessConsulta } from '@/lib/auth/permissions'
import { conversaUpdateSchema, idParamSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/conversas/[id] - Buscar conversa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['conversas:read'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da conversa inválido.'
        },
        { status: 400 }
      )
    }
    
    const conversaId = idValidation.data.id
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar conversa com dados relacionados
    const { data: conversa, error } = await supabase
      .from('conversas')
      .select(`
        id,
        consulta_id,
        paciente_id,
        medico_id,
        titulo,
        ativa,
        created_at,
        updated_at,
        consultas!inner(
          id,
          data_consulta,
          tipo,
          status,
          clinica_id,
          observacoes
        ),
        pacientes!inner(
          id,
          nome_completo,
          email,
          telefone,
          data_nascimento
        ),
        perfis!medico_id(
          id,
          nome_completo,
          especialidade,
          crm
        )
      `)
      .eq('id', conversaId)
      .single()
    
    if (error || !conversa) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Conversa não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta conversa
    if (!await canAccessConsulta(user, conversa.consulta_id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar esta conversa.'
        },
        { status: 403 }
      )
    }
    
    // Buscar mensagens da conversa
    const { data: mensagens, error: mensagensError } = await supabase
      .from('mensagens')
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
      .eq('conversa_id', conversaId)
      .order('created_at', { ascending: true })
    
    if (mensagensError) {
      console.error('Erro ao buscar mensagens:', mensagensError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar mensagens da conversa.'
        },
        { status: 500 }
      )
    }
    
    // Marcar mensagens como lidas se o usuário for o destinatário
    if (mensagens && mensagens.length > 0) {
      const mensagensNaoLidas = mensagens.filter(msg => 
        !msg.lida && 
        (
          (msg.remetente_tipo === 'paciente' && user.role === 'medico' && user.id === conversa.medico_id) ||
          (msg.remetente_tipo === 'medico' && user.role !== 'medico')
        )
      )
      
      if (mensagensNaoLidas.length > 0) {
        const { error: updateError } = await supabase
          .from('mensagens')
          .update({ lida: true })
          .in('id', mensagensNaoLidas.map(msg => msg.id))
        
        if (updateError) {
          console.error('Erro ao marcar mensagens como lidas:', updateError)
        }
      }
    }
    
    return NextResponse.json({ 
      data: {
        ...conversa,
        mensagens: mensagens || []
      }
    })
    
  } catch (error) {
    console.error('Erro inesperado ao buscar conversa:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// PUT /api/conversas/[id] - Atualizar conversa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['conversas:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da conversa inválido.'
        },
        { status: 400 }
      )
    }
    
    const conversaId = idValidation.data.id
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = conversaUpdateSchema.safeParse(body)
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
    
    // Buscar conversa existente com dados da consulta
    const { data: existingConversa, error: fetchError } = await supabase
      .from('conversas')
      .select(`
        *,
        consultas!inner(
          id,
          paciente_id,
          medico_id,
          clinica_id,
          status
        )
      `)
      .eq('id', conversaId)
      .single()
    
    if (fetchError || !existingConversa) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Conversa não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta conversa
    if (!await canAccessConsulta(user, existingConversa.consulta_id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para atualizar esta conversa.'
        },
        { status: 403 }
      )
    }
    
    // Atualizar conversa
    const { data: updatedConversa, error: updateError } = await supabase
      .from('conversas')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversaId)
      .select(`
        id,
        consulta_id,
        paciente_id,
        medico_id,
        titulo,
        ativa,
        created_at,
        updated_at,
        consultas!inner(
          id,
          data_consulta,
          tipo,
          status
        ),
        pacientes!inner(
          id,
          nome_completo,
          email,
          telefone
        ),
        perfis!medico_id(
          id,
          nome_completo,
          especialidade
        )
      `)
      .single()
    
    if (updateError) {
      console.error('Erro ao atualizar conversa:', updateError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao atualizar conversa.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Conversa atualizada com sucesso.',
      data: updatedConversa
    })
    
  } catch (error) {
    console.error('Erro inesperado na atualização de conversa:', error)
    
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

// DELETE /api/conversas/[id] - Deletar conversa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['conversas:delete'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da conversa inválido.'
        },
        { status: 400 }
      )
    }
    
    const conversaId = idValidation.data.id
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar conversa existente com dados da consulta
    const { data: existingConversa, error: fetchError } = await supabase
      .from('conversas')
      .select(`
        *,
        consultas!inner(
          id,
          paciente_id,
          medico_id,
          clinica_id,
          status
        )
      `)
      .eq('id', conversaId)
      .single()
    
    if (fetchError || !existingConversa) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Conversa não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta conversa
    if (!await canAccessConsulta(user, existingConversa.consulta_id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para deletar esta conversa.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se existem mensagens associadas
    const { data: mensagens, error: mensagensError } = await supabase
      .from('mensagens')
      .select('id')
      .eq('conversa_id', conversaId)
      .limit(1)
    
    if (mensagensError) {
      console.error('Erro ao verificar mensagens associadas:', mensagensError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao verificar dependências da conversa.'
        },
        { status: 500 }
      )
    }
    
    // Se existem mensagens, deletá-las primeiro (cascade delete)
    if (mensagens && mensagens.length > 0) {
      const { error: deleteMensagensError } = await supabase
        .from('mensagens')
        .delete()
        .eq('conversa_id', conversaId)
      
      if (deleteMensagensError) {
        console.error('Erro ao deletar mensagens:', deleteMensagensError)
        return NextResponse.json(
          { 
            error: 'Database error',
            message: 'Erro ao deletar mensagens da conversa.'
          },
          { status: 500 }
        )
      }
    }
    
    // Deletar conversa
    const { error: deleteError } = await supabase
      .from('conversas')
      .delete()
      .eq('id', conversaId)
    
    if (deleteError) {
      console.error('Erro ao deletar conversa:', deleteError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao deletar conversa.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Conversa deletada com sucesso.'
    })
    
  } catch (error) {
    console.error('Erro inesperado na deleção de conversa:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}