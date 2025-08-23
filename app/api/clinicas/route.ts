
import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth } from '@/lib/auth/permissions'
import { clinicaCreateSchema, queryParamsSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/clinicas - Listar clínicas
export async function GET(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['clinicas:read'])
  if (authResult.error) return authResult.error
  
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
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Construir query base
    let query = supabase
      .from('clinicas')
      .select(`
        id,
        nome,
        descricao,
        endereco,
        telefone,
        email,
        site,
        logo_url,
        configuracoes,
        criado_em,
        atualizado_em
      `, { count: 'exact' })
    
    // Aplicar busca se especificada
    if (search) {
      query = query.or(`nome.ilike.%${search}%,endereco.ilike.%${search}%`)
    }
    
    // Aplicar ordenação
    const sortField = sort || 'criado_em'
    query = query.order(sortField, { ascending: order === 'asc' })
    
    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)
    
    const { data: clinicas, error, count } = await query
    
    if (error) {
      console.error('Erro ao buscar clínicas:', error)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar clínicas.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: clinicas,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Erro inesperado na API de clínicas:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// POST /api/clinicas - Criar nova clínica
export async function POST(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['clinicas:write'])
  if (authResult.error) return authResult.error
  
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = clinicaCreateSchema.safeParse(body)
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
    
    const clinicaData = validation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar se já existe clínica com o mesmo nome
    const { data: existingClinica, error: checkError } = await supabase
      .from('clinicas')
      .select('id')
      .eq('nome', clinicaData.nome)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao verificar nome existente:', checkError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao verificar dados da clínica.'
        },
        { status: 500 }
      )
    }
    
    if (existingClinica) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Já existe uma clínica com este nome.'
        },
        { status: 409 }
      )
    }
    
    // Criar clínica
    const { data: newClinica, error: createError } = await supabase
      .from('clinicas')
      .insert([clinicaData])
      .select(`
        id,
        nome,
        descricao,
        endereco,
        telefone,
        email,
        site,
        logo_url,
        configuracoes,
        criado_em,
        atualizado_em
      `)
      .single()
    
    if (createError) {
      console.error('Erro ao criar clínica:', createError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao criar clínica.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Clínica criada com sucesso.',
        data: newClinica
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Erro inesperado na criação de clínica:', error)
    
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
