
import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth, canAccessClinica } from '@/lib/auth/permissions'
import { perfilCreateSchema, queryParamsSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/perfis - Listar perfis (profissionais)
export async function GET(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['perfis:read'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    const { searchParams } = new URL(request.url)
    const queryValidation = queryParamsSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      sort: searchParams.get('sort'),
      order: searchParams.get('order'),
      clinica_id: searchParams.get('clinica_id')
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
    
    const { page, limit, search, sort, order, clinica_id } = queryValidation.data
    const offset = (page - 1) * limit
    
    // Parâmetro para filtrar tipo de cargo
    const cargo = searchParams.get('cargo')
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Construir query base - CAMPOS CORRETOS conforme banco.sql
    let query = supabase
      .from('perfis')
      .select(`
        id,
        nome_completo,
        email,
        cargo,
        clinica_id,
        telefone,
        foto_url,
        criado_em,
        atualizado_em
      `, { count: 'exact' })
    
    // Filtrar por clínica se especificado
    const targetClinicaId = clinica_id || user.clinica_id
    
    // Verificar se o usuário pode acessar a clínica solicitada
    if (!canAccessClinica(user, targetClinicaId)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar perfis desta clínica.'
        },
        { status: 403 }
      )
    }
    
    if (targetClinicaId) {
      query = query.eq('clinica_id', targetClinicaId)
    }
    
    // Filtrar por cargo se especificado (para buscar apenas médicos, por exemplo)
    if (cargo) {
      if (cargo === 'medicos') {
        // Buscar médicos e admins que podem realizar consultas
        query = query.in('cargo', ['medico', 'admin'])
      } else {
        query = query.eq('cargo', cargo)
      }
    }
    
    // Aplicar busca se especificada
    if (search) {
      query = query.or(`nome_completo.ilike.%${search}%,email.ilike.%${search}%`)
    }
    
    // Aplicar ordenação
    const sortField = sort || 'nome_completo'
    query = query.order(sortField, { ascending: order === 'asc' })
    
    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)
    
    const { data: perfis, error, count } = await query
    
    if (error) {
      console.error('Erro ao buscar perfis:', error)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar perfis.',
          details: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: perfis,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Erro inesperado na API de perfis:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// POST /api/perfis - Criar novo perfil
export async function POST(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['perfis:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = perfilCreateSchema.safeParse(body)
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
    
    const perfilData = validation.data
    
    // Verificar se o usuário pode criar perfis para a clínica especificada
    if (perfilData.clinica_id && !canAccessClinica(user, perfilData.clinica_id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para criar perfis nesta clínica.'
        },
        { status: 403 }
      )
    }
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar se já existe perfil com o mesmo email na clínica
    const { data: existingPerfil } = await supabase
      .from('perfis')
      .select('id')
      .eq('email', perfilData.email)
      .single()
    
    if (existingPerfil) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Já existe um perfil com este email.'
        },
        { status: 409 }
      )
    }
    
    // Criar perfil
    const { data: newPerfil, error: createError } = await supabase
      .from('perfis')
      .insert([perfilData])
      .select(`
        id,
        nome_completo,
        email,
        cargo,
        clinica_id,
        telefone,
        foto_url,
        criado_em,
        atualizado_em
      `)
      .single()
    
    if (createError) {
      console.error('Erro ao criar perfil:', createError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao criar perfil.',
          details: createError.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Perfil criado com sucesso.',
        data: newPerfil
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Erro inesperado na criação de perfil:', error)
    
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
