import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth } from '@/lib/auth/permissions'
import { mensagemCreateSchema, queryParamsSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/mensagens - Listar mensagens
export async function GET(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['mensagens:read'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    const { searchParams } = new URL(request.url)
    const queryValidation = queryParamsSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      sort: searchParams.get('sort'),
      order: searchParams.get('order')
    })
    
    if (!queryValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: queryValidation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { page, limit, search, sort, order } = queryValidation.data
    const offset = (page - 1) * limit
    
    // Parâmetros obrigatórios para mensagens
    const conversa_id = searchParams.get('conversa_id')
    if (!conversa_id) {
      return NextResponse.json(
        { 
          error: 'Missing parameter',
          message: 'ID da conversa é obrigatório.'
        },
        { status: 400 }
      )
    }
    
    // Parâmetros adicionais específicos para mensagens
    const tipo_remetente = searchParams.get('tipo_remetente')
    const lida = searchParams.get('lida')
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Primeiro, verificar se o usuário pode acessar a conversa
    const { data: conversa, error: conversaError } = await supabase
      .from('conversas')
      .select(`
        id,
        clinica_id,
        paciente_id,
        atribuida_para,
        status,
        criado_em,
        atualizado_em
      `)
      .eq('id', conversa_id)
      .single()
    
    if (conversaError || !conversa) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Conversa não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta conversa
    const canAccess = (
      user.role === 'admin' ||
      (user.role === 'medico' && user.clinica_id === conversa.clinica_id) ||
      (user.role === 'paciente' && user.id === conversa.paciente_id)
    )
    
    if (!canAccess) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar mensagens desta conversa.'
        },
        { status: 403 }
      )
    }
    
    // Construir query base
    let query = supabase
      .from('mensagens')
      .select(`
        id,
        conversa_id,
        conteudo,
        tipo_remetente,
        remetente_id,
        lida,
        criado_em,
        atualizado_em
      `, { count: 'exact' })
      .eq('conversa_id', conversa_id)
    
    // Aplicar filtros específicos
    if (tipo_remetente) {
      query = query.eq('tipo_remetente', tipo_remetente)
    }
    
    if (lida !== null) {
      query = query.eq('lida', lida === 'true')
    }
    
    // Aplicar busca se especificada
    if (search) {
      query = query.ilike('conteudo', `%${search}%`)
    }
    
    // Aplicar ordenação
    const sortField = sort || 'criado_em'
    query = query.order(sortField, { ascending: order === 'asc' })
    
    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)
    
    const { data: mensagens, error, count } = await query
    
    if (error) {
      console.error('Erro ao buscar mensagens:', error)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar mensagens.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: mensagens,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Erro inesperado na API de mensagens:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// POST /api/mensagens - Criar nova mensagem
export async function POST(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['mensagens:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = mensagemCreateSchema.safeParse(body)
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
    
    const mensagemData = validation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar conversa para validação
    const { data: conversa, error: conversaError } = await supabase
      .from('conversas')
      .select(`
        id,
        paciente_id,
        plataforma,
        status,
        atribuida_para,
        clinica_id,
        ativa
      `)
      .eq('id', mensagemData.conversa_id)
      .single()
    
    if (conversaError || !conversa) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Conversa não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta conversa
    const canAccess = (
      user.role === 'admin' ||
      (user.role === 'medico' && user.clinica_id === conversa.clinica_id) ||
      (user.role === 'paciente' && user.id === conversa.paciente_id)
    )
    
    if (!canAccess) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para enviar mensagens nesta conversa.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se a conversa está ativa
    if (conversa.status !== 'ativa') {
      return NextResponse.json(
        { 
          error: 'Bad Request',
          message: 'Não é possível enviar mensagens em conversas inativas.'
        },
        { status: 409 }
      )
    }
    
    // Validar remetente baseado no tipo
    let remetenteValido = false
    
    if (mensagemData.tipo_remetente === 'medico') {
      // Verificar se o usuário é médico e é o médico da conversa
      remetenteValido = user.role === 'medico' && user.id === conversa.atribuida_para
      mensagemData.remetente_id = user.id
    } else if (mensagemData.tipo_remetente === 'paciente') {
      // Para mensagens de paciente, verificar se o usuário tem permissão de representar o paciente
      // (admin/médico podem enviar mensagens em nome do paciente)
      if (user.role === 'admin' || user.role === 'super_admin' || 
          (user.role === 'medico' && user.id === conversa.atribuida_para)) {
        remetenteValido = true
        mensagemData.remetente_id = conversa.paciente_id
      }
    } else if (mensagemData.tipo_remetente === 'sistema') {
      // Apenas admins podem enviar mensagens do sistema
      remetenteValido = user.role === 'admin' || user.role === 'super_admin'
      mensagemData.remetente_id = user.id
    }
    
    if (!remetenteValido) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para enviar mensagens como este tipo de remetente.'
        },
        { status: 403 }
      )
    }
    
    // Criar mensagem
    const { data: newMensagem, error: createError } = await supabase
      .from('mensagens')
      .insert([mensagemData])
      .select(`
        id,
        conversa_id,
        conteudo,
        remetente_tipo,
        remetente_id,
        lida,
        criado_em,
        atualizado_em
      `)
      .single()
    
    if (createError) {
      console.error('Erro ao criar mensagem:', createError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao criar mensagem.'
        },
        { status: 500 }
      )
    }
    
    // Atualizar timestamp da conversa
    const { error: updateConversaError } = await supabase
      .from('conversas')
      .update({ atualizado_em: new Date().toISOString() })
      .eq('id', mensagemData.conversa_id)
    
    if (updateConversaError) {
      console.error('Erro ao atualizar conversa:', updateConversaError)
      // Não retornar erro, pois a mensagem foi criada com sucesso
    }
    
    return NextResponse.json(
      { 
        message: 'Mensagem enviada com sucesso.',
        data: newMensagem
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Erro inesperado na criação de mensagem:', error)
    
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