import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth } from '@/lib/auth/permissions'
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
    const paciente_id = searchParams.get('paciente_id')
    const medico_id = searchParams.get('medico_id')
    const ativa = searchParams.get('ativa')
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Construir query base
    let query = supabase
      .from('conversas')
      .select(`
        id,
        paciente_id,
        plataforma,
        status,
        atribuida_para,
        ultima_mensagem_em,
        criado_em,
        atualizado_em,
        pacientes!inner(
          id,
          nome_completo,
          email,
          telefone_celular
        ),
        perfis!atribuida_para(
          id,
          nome_completo
        )
      `, { count: 'exact' })
    
    // Filtrar por clínica do usuário
    if (user.role !== 'super_admin') {
      query = query.eq('clinica_id', user.clinica_id)
    }
    
    // Médicos só veem suas próprias conversas
    if (user.role === 'medico') {
      query = query.eq('atribuida_para', user.id)
    }
    
    // Aplicar filtros específicos
    
    if (paciente_id) {
      query = query.eq('paciente_id', paciente_id)
    }
    
    if (medico_id && user.role !== 'medico') {
      query = query.eq('atribuida_para', medico_id)
    }
    
    if (ativa !== null) {
      query = query.eq('ativa', ativa === 'true')
    }
    
    // Aplicar busca se especificada
    if (search) {
      query = query.or(`titulo.ilike.%${search}%,pacientes.nome_completo.ilike.%${search}%`)
    }
    
    // Aplicar ordenação
    const sortField = sort || 'atualizado_em'
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
          .select('conteudo, criado_em, tipo_remetente')
          .eq('conversa_id', conversa.id)
          .order('criado_em', { ascending: false })
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
    
    // Verificar se o usuário pode criar conversas para esta clínica/paciente
    const canCreate = (
      user.role === 'admin' ||
      (user.role === 'medico' && user.clinica_id === conversaData.clinica_id) ||
      (user.role === 'paciente' && user.id === conversaData.paciente_id)
    )
    
    if (!canCreate) {
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
    
    // Nota: Verificação de conversa existente removida pois não há mais relação direta com consultas
    
    // Criar conversa
    const { data: newConversa, error: createError } = await supabase
      .from('conversas')
      .insert([conversaData])
      .select(`
        id,
        paciente_id,
        clinica_id,
        titulo,
        plataforma,
        status,
        atribuida_para,
        ultima_mensagem_em,
        criado_em,
        atualizado_em,
        pacientes!inner(
          id,
          nome_completo,
          email,
          telefone_celular
        ),
        perfis!atribuida_para(
          id,
          nome_completo
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