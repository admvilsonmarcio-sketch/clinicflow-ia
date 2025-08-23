
import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth, canAccessClinica } from '@/lib/auth/permissions'
import { patientCreateSchema, queryParamsSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/patients - Listar pacientes
export async function GET(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['patients:read'])
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
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Construir query base - CAMPOS CORRIGIDOS conforme banco.sql
    let query = supabase
      .from('pacientes')
      .select(`
        id,
        nome_completo,
        email,
        data_nascimento,
        genero,
        telefone_celular,
        telefone_fixo,
        cpf,
        rg,
        orgao_emissor,
        uf_rg,
        estado_civil,
        profissao,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        nome_emergencia,
        parentesco_emergencia,
        telefone_emergencia,
        observacoes_emergencia,
        tipo_sanguineo,
        alergias_conhecidas,
        medicamentos_uso,
        historico_medico_detalhado,
        observacoes_gerais,
        convenio_medico,
        numero_carteirinha,
        status,
        status_ativo,
        clinica_id,
        criado_em,
        atualizado_em,
        clinicas!inner(nome)
      `, { count: 'exact' })
    
    // Filtrar por clínica se especificado
    const targetClinicaId = clinica_id || user.clinica_id
    
    // Verificar se o usuário pode acessar a clínica solicitada
    if (!canAccessClinica(user, targetClinicaId)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar pacientes desta clínica.'
        },
        { status: 403 }
      )
    }
    
    query = query.eq('clinica_id', targetClinicaId)
    
    // Aplicar busca se especificada
    if (search) {
      query = query.or(`nome_completo.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`)
    }
    
    // Aplicar ordenação
    const sortField = sort || 'criado_em'
    query = query.order(sortField, { ascending: order === 'asc' })
    
    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)
    
    const { data: patients, error, count } = await query
    
    if (error) {
      console.error('Erro ao buscar pacientes:', error)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar pacientes.',
          details: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: patients,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Erro inesperado na API de pacientes:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// POST /api/patients - Criar novo paciente
export async function POST(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['patients:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = patientCreateSchema.safeParse(body)
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
    
    const patientData = validation.data
    
    // Verificar se o usuário pode criar pacientes para a clínica especificada
    if (!canAccessClinica(user, patientData.clinica_id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para criar pacientes nesta clínica.'
        },
        { status: 403 }
      )
    }
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar se já existe paciente com o mesmo email na clínica
    const { data: existingPatient } = await supabase
      .from('pacientes')
      .select('id')
      .eq('email', patientData.email)
      .eq('clinica_id', patientData.clinica_id)
      .single()
    
    if (existingPatient) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Já existe um paciente com este email nesta clínica.'
        },
        { status: 409 }
      )
    }
    
    // Verificar CPF se fornecido
    if (patientData.cpf) {
      const { data: existingCpf } = await supabase
        .from('pacientes')
        .select('id')
        .eq('cpf', patientData.cpf)
        .eq('clinica_id', patientData.clinica_id)
        .single()
      
      if (existingCpf) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Já existe um paciente com este CPF nesta clínica.'
          },
          { status: 409 }
        )
      }
    }
    
    // Criar paciente - USANDO CAMPOS CORRETOS
    const { data: newPatient, error: createError } = await supabase
      .from('pacientes')
      .insert([patientData])
      .select(`
        id,
        nome_completo,
        email,
        data_nascimento,
        genero,
        telefone_celular,
        telefone_fixo,
        cpf,
        rg,
        orgao_emissor,
        uf_rg,
        estado_civil,
        profissao,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        nome_emergencia,
        parentesco_emergencia,
        telefone_emergencia,
        observacoes_emergencia,
        tipo_sanguineo,
        alergias_conhecidas,
        medicamentos_uso,
        historico_medico_detalhado,
        observacoes_gerais,
        convenio_medico,
        numero_carteirinha,
        status,
        status_ativo,
        clinica_id,
        criado_em,
        atualizado_em
      `)
      .single()
    
    if (createError) {
      console.error('Erro ao criar paciente:', createError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao criar paciente.',
          details: createError.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Paciente criado com sucesso.',
        data: newPatient
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Erro inesperado na criação de paciente:', error)
    
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
