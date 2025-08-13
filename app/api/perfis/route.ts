import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth, canAccessClinica } from '@/lib/auth/permissions'
import { perfilCreateSchema, queryParamsSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/perfis - Listar perfis/usuários
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
    
    // Parâmetros adicionais específicos para perfis
    const cargo = searchParams.get('cargo')
    const ativo = searchParams.get('ativo')
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Construir query base
    let query = supabase
      .from('perfis')
      .select(`
        id,
        nome_completo,
        email,
        telefone,
        cargo,
        especialidade,
        crm,
        clinica_id,
        ativo,
        created_at,
        updated_at,
        clinicas!inner(id, nome)
      `, { count: 'exact' })
    
    // Filtrar por clínica
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
    
    // Super admins podem ver perfis de todas as clínicas
    if (user.role !== 'super_admin') {
      query = query.eq('clinica_id', targetClinicaId)
    } else if (targetClinicaId) {
      query = query.eq('clinica_id', targetClinicaId)
    }
    
    // Aplicar filtros específicos
    if (cargo) {
      query = query.eq('cargo', cargo)
    }
    
    if (ativo !== null) {
      query = query.eq('ativo', ativo === 'true')
    }
    
    // Aplicar busca se especificada
    if (search) {
      query = query.or(`nome_completo.ilike.%${search}%,email.ilike.%${search}%,crm.ilike.%${search}%,especialidade.ilike.%${search}%`)
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
          message: 'Erro ao buscar perfis.'
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

// POST /api/perfis - Criar novo perfil/usuário
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
    if (!canAccessClinica(user, perfilData.clinica_id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para criar perfis nesta clínica.'
        },
        { status: 403 }
      )
    }
    
    // Apenas admins e super_admins podem criar outros admins
    if (perfilData.cargo === 'admin' && user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para criar administradores.'
        },
        { status: 403 }
      )
    }
    
    // Apenas super_admins podem criar outros super_admins
    if (perfilData.cargo === 'super_admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Apenas super administradores podem criar outros super administradores.'
        },
        { status: 403 }
      )
    }
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar se já existe usuário com o mesmo e-mail
    const { data: existingUser, error: emailCheckError } = await supabase
      .from('perfis')
      .select('id, email')
      .eq('email', perfilData.email)
      .single()
    
    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('Erro ao verificar e-mail existente:', emailCheckError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao verificar dados do usuário.'
        },
        { status: 500 }
      )
    }
    
    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Já existe um usuário cadastrado com este e-mail.'
        },
        { status: 409 }
      )
    }
    
    // Verificar se já existe médico com o mesmo CRM (se aplicável)
    if (perfilData.crm) {
      const { data: existingCrm, error: crmCheckError } = await supabase
        .from('perfis')
        .select('id, crm')
        .eq('crm', perfilData.crm)
        .single()
      
      if (crmCheckError && crmCheckError.code !== 'PGRST116') {
        console.error('Erro ao verificar CRM existente:', crmCheckError)
        return NextResponse.json(
          { 
            error: 'Database error',
            message: 'Erro ao verificar dados do médico.'
          },
          { status: 500 }
        )
      }
      
      if (existingCrm) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Já existe um médico cadastrado com este CRM.'
          },
          { status: 409 }
        )
      }
    }
    
    // Verificar se a clínica existe
    const { data: clinica, error: clinicaError } = await supabase
      .from('clinicas')
      .select('id, nome, ativa')
      .eq('id', perfilData.clinica_id)
      .single()
    
    if (clinicaError || !clinica) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Clínica não encontrada.'
        },
        { status: 404 }
      )
    }
    
    if (!clinica.ativa) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Não é possível criar usuários em clínicas inativas.'
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
        telefone,
        cargo,
        especialidade,
        crm,
        clinica_id,
        ativo,
        created_at,
        updated_at,
        clinicas!inner(id, nome)
      `)
      .single()
    
    if (createError) {
      console.error('Erro ao criar perfil:', createError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao criar perfil.'
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