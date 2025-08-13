import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth, canAccessConsulta } from '@/lib/auth/permissions'
import { conversaCreateSchema, queryParamsSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/conversas - Listar conversas
export async function GET(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['conversas:read'])
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
    
    // Parâmetros adicionais específicos para conversas
    const consulta_id = searchParams.get('consulta_id')
    const paciente_id = searchParams.get('paciente_id')
    const medico_id = searchParams.get('medico_id')
    const ativa = searchParams.get('ativa')
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Construir query base
    let query = supabase
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
          clinica_id
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
      `, { count: 'exact' })
    
    // Filtrar por clínica do usuário (através da consulta)
    if (user.role !== 'super_admin') {
      query = query.eq('consultas.clinica_id', user.clinica_id)
    }
    
    // Médicos só veem suas próprias conversas
    if (user.role === 'medico') {
      query = query.eq('medico_id', user.id)
    }
    
    // Aplicar filtros específicos
    if (consulta_id) {
      query = query.eq('consulta_id', consulta_id)
    }
    
    if (paciente_id) {
      query = query.eq('paciente_id', paciente_id)
    }
    
    if (medico_id && user.role !== 'medico') {
      query = query.eq('medico_id', medico_id)
    }
    
    if (ativa !== null) {
      query = query.eq('ativa', ativa === 'true')
    }
    
    // Aplicar busca se especificada
    if (search) {
      query = query.or(`titulo.ilike.%${search}%,pacientes.nome_completo.ilike.%${search}%`)
    }
    
    // Aplicar ordenação
    const sortField = sort || 'updated_at'
    query = query.order(sortField, { ascending: order === 'asc' })
    
    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)
    
    const { data: conversas, error, count } = await query
    
    if (error) {
      console.error('Erro ao buscar conversas:', error)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar conversas.'
        },
        { status: 500 }
      )
    }
    
    // Adicionar contagem de mensagens para cada conversa
    const conversasComStats = await Promise.all(
      (conversas || []).map(async (conversa) => {
        const { count: mensagensCount } = await supabase
          .from('mensagens')
          .select('id', { count: 'exact', head: true })
          .eq('conversa_id', conversa.id)
        
        const { data: ultimaMensagem } = await supabase
          .from('mensagens')
          .select('conteudo, created_at, remetente_tipo')
          .eq('conversa_id', conversa.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        return {
          ...conversa,
          stats: {
            total_mensagens: mensagensCount || 0,
            ultima_mensagem: ultimaMensagem
          }
        }
      })
    )
    
    return NextResponse.json({
      data: conversasComStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Erro inesperado na API de conversas:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// POST /api/conversas - Criar nova conversa
export async function POST(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['conversas:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = conversaCreateSchema.safeParse(body)
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
    
    const conversaData = validation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar consulta para validação
    const { data: consulta, error: consultaError } = await supabase
      .from('consultas')
      .select(`
        id,
        paciente_id,
        medico_id,
        clinica_id,
        status,
        pacientes!inner(id, nome_completo, clinica_id),
        perfis!medico_id(id, nome_completo, clinica_id)
      `)
      .eq('id', conversaData.consulta_id)
      .single()
    
    if (consultaError || !consulta) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Consulta não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta consulta
    if (!await canAccessConsulta(user, consulta.id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para criar conversas para esta consulta.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se os IDs de paciente e médico coincidem com a consulta
    if (conversaData.paciente_id !== consulta.paciente_id) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'ID do paciente não coincide com a consulta.'
        },
        { status: 409 }
      )
    }
    
    if (conversaData.medico_id !== consulta.medico_id) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'ID do médico não coincide com a consulta.'
        },
        { status: 409 }
      )
    }
    
    // Verificar se já existe uma conversa para esta consulta
    const { data: existingConversa, error: existingError } = await supabase
      .from('conversas')
      .select('id')
      .eq('consulta_id', conversaData.consulta_id)
      .single()
    
    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Erro ao verificar conversa existente:', existingError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao verificar dados da conversa.'
        },
        { status: 500 }
      )
    }
    
    if (existingConversa) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Já existe uma conversa para esta consulta.'
        },
        { status: 409 }
      )
    }
    
    // Criar conversa
    const { data: newConversa, error: createError } = await supabase
      .from('conversas')
      .insert([conversaData])
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
    
    if (createError) {
      console.error('Erro ao criar conversa:', createError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao criar conversa.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Conversa criada com sucesso.',
        data: newConversa
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Erro inesperado na criação de conversa:', error)
    
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