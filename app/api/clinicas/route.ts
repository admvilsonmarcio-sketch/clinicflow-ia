import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth } from '@/lib/auth/permissions'
import { clinicaCreateSchema, queryParamsSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/clinicas - Listar clínicas
export async function GET(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['clinicas:read'])
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
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Construir query base
    let query = supabase
      .from('clinicas')
      .select(`
        id,
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        site,
        especialidades,
        horario_funcionamento,
        ativa,
        created_at,
        updated_at
      `, { count: 'exact' })
    
    // Super admins podem ver todas as clínicas, outros usuários só a sua própria
    if (user.role !== 'super_admin') {
      query = query.eq('id', user.clinica_id)
    }
    
    // Aplicar busca se especificada
    if (search) {
      query = query.or(`nome.ilike.%${search}%,cnpj.ilike.%${search}%,endereco.ilike.%${search}%`)
    }
    
    // Aplicar ordenação
    const sortField = sort || 'nome'
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

// POST /api/clinicas - Criar nova clínica (apenas super_admin)
export async function POST(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['clinicas:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  // Apenas super admins podem criar clínicas
  if (user.role !== 'super_admin') {
    return NextResponse.json(
      { 
        error: 'Forbidden',
        message: 'Apenas super administradores podem criar clínicas.'
      },
      { status: 403 }
    )
  }
  
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
    
    // Verificar se já existe clínica com o mesmo CNPJ
    const { data: existingClinica, error: checkError } = await supabase
      .from('clinicas')
      .select('id, cnpj')
      .eq('cnpj', clinicaData.cnpj)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao verificar CNPJ existente:', checkError)
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
          message: 'Já existe uma clínica cadastrada com este CNPJ.'
        },
        { status: 409 }
      )
    }
    
    // Verificar se já existe clínica com o mesmo e-mail
    if (clinicaData.email) {
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('clinicas')
        .select('id, email')
        .eq('email', clinicaData.email)
        .single()
      
      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        console.error('Erro ao verificar e-mail existente:', emailCheckError)
        return NextResponse.json(
          { 
            error: 'Database error',
            message: 'Erro ao verificar dados da clínica.'
          },
          { status: 500 }
        )
      }
      
      if (existingEmail) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Já existe uma clínica cadastrada com este e-mail.'
          },
          { status: 409 }
        )
      }
    }
    
    // Criar clínica
    const { data: newClinica, error: createError } = await supabase
      .from('clinicas')
      .insert([clinicaData])
      .select(`
        id,
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        site,
        especialidades,
        horario_funcionamento,
        ativa,
        created_at,
        updated_at
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