import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth, canAccessClinica } from '@/lib/auth/permissions'
import { consultaCreateSchema, queryParamsSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/consultas - Listar consultas
export async function GET(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['consultas:read'])
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
    
    // Parâmetros adicionais específicos para consultas
    const status = searchParams.get('status')
    const medico_id = searchParams.get('medico_id')
    const paciente_id = searchParams.get('paciente_id')
    const data_inicio = searchParams.get('data_inicio')
    const data_fim = searchParams.get('data_fim')
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Construir query base
    let query = supabase
      .from('consultas')
      .select(`
        id,
        paciente_id,
        medico_id,
        clinica_id,
        data_consulta,
        tipo,
        status,
        observacoes,
        google_calendar_event_id,
        valor,
        duracao_minutos,
        created_at,
        updated_at,
        pacientes!inner(id, nome_completo, email, telefone),
        perfis!medico_id(id, nome_completo, cargo, especialidade),
        clinicas!inner(id, nome)
      `, { count: 'exact' })
    
    // Filtrar por clínica
    const targetClinicaId = clinica_id || user.clinica_id
    
    // Verificar se o usuário pode acessar a clínica solicitada
    if (!canAccessClinica(user, targetClinicaId)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar consultas desta clínica.'
        },
        { status: 403 }
      )
    }
    
    query = query.eq('clinica_id', targetClinicaId)
    
    // Médicos só veem suas próprias consultas (exceto admins)
    if (user.role === 'medico') {
      query = query.eq('medico_id', user.id)
    }
    
    // Aplicar filtros específicos
    if (status) {
      query = query.eq('status', status)
    }
    
    if (medico_id && user.role !== 'medico') {
      query = query.eq('medico_id', medico_id)
    }
    
    if (paciente_id) {
      query = query.eq('paciente_id', paciente_id)
    }
    
    if (data_inicio) {
      query = query.gte('data_consulta', data_inicio)
    }
    
    if (data_fim) {
      query = query.lte('data_consulta', data_fim)
    }
    
    // Aplicar busca se especificada
    if (search) {
      query = query.or(`pacientes.nome_completo.ilike.%${search}%,observacoes.ilike.%${search}%`)
    }
    
    // Aplicar ordenação
    const sortField = sort || 'data_consulta'
    query = query.order(sortField, { ascending: order === 'asc' })
    
    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)
    
    const { data: consultas, error, count } = await query
    
    if (error) {
      console.error('Erro ao buscar consultas:', error)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar consultas.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data: consultas,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('Erro inesperado na API de consultas:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// POST /api/consultas - Criar nova consulta
export async function POST(request: NextRequest) {
  const authResult = await withMedicalAuth(request, ['consultas:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = consultaCreateSchema.safeParse(body)
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
    
    const consultaData = validation.data
    
    // Verificar se o usuário pode criar consultas para a clínica especificada
    if (!canAccessClinica(user, consultaData.clinica_id)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para criar consultas nesta clínica.'
        },
        { status: 403 }
      )
    }
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar se o paciente existe e pertence à clínica
    const { data: paciente, error: pacienteError } = await supabase
      .from('pacientes')
      .select('id, clinica_id, nome_completo')
      .eq('id', consultaData.paciente_id)
      .single()
    
    if (pacienteError || !paciente) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Paciente não encontrado.'
        },
        { status: 404 }
      )
    }
    
    if (paciente.clinica_id !== consultaData.clinica_id) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Paciente não pertence à clínica especificada.'
        },
        { status: 409 }
      )
    }
    
    // Verificar se o médico existe e pertence à clínica
    const { data: medico, error: medicoError } = await supabase
      .from('perfis')
      .select('id, clinica_id, nome_completo, cargo')
      .eq('id', consultaData.medico_id)
      .single()
    
    if (medicoError || !medico) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Médico não encontrado.'
        },
        { status: 404 }
      )
    }
    
    if (medico.clinica_id !== consultaData.clinica_id) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Médico não pertence à clínica especificada.'
        },
        { status: 409 }
      )
    }
    
    if (medico.cargo !== 'medico' && medico.cargo !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Usuário especificado não é um médico.'
        },
        { status: 409 }
      )
    }
    
    // Verificar conflito de horário para o médico
    const dataConsulta = new Date(consultaData.data_consulta)
    const inicioConsulta = new Date(dataConsulta.getTime() - (15 * 60 * 1000)) // 15 min antes
    const fimConsulta = new Date(dataConsulta.getTime() + (consultaData.duracao_minutos * 60 * 1000) + (15 * 60 * 1000)) // duração + 15 min depois
    
    const { data: conflitos, error: conflitosError } = await supabase
      .from('consultas')
      .select('id, data_consulta, duracao_minutos')
      .eq('medico_id', consultaData.medico_id)
      .in('status', ['agendada', 'confirmada', 'em_andamento'])
      .gte('data_consulta', inicioConsulta.toISOString())
      .lte('data_consulta', fimConsulta.toISOString())
    
    if (conflitosError) {
      console.error('Erro ao verificar conflitos de horário:', conflitosError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao verificar disponibilidade do médico.'
        },
        { status: 500 }
      )
    }
    
    if (conflitos && conflitos.length > 0) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Médico já possui consulta agendada neste horário.'
        },
        { status: 409 }
      )
    }
    
    // Criar consulta
    const { data: newConsulta, error: createError } = await supabase
      .from('consultas')
      .insert([consultaData])
      .select(`
        id,
        paciente_id,
        medico_id,
        clinica_id,
        data_consulta,
        tipo,
        status,
        observacoes,
        google_calendar_event_id,
        valor,
        duracao_minutos,
        created_at,
        updated_at,
        pacientes!inner(id, nome_completo, email, telefone),
        perfis!medico_id(id, nome_completo, cargo, especialidade)
      `)
      .single()
    
    if (createError) {
      console.error('Erro ao criar consulta:', createError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao criar consulta.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        message: 'Consulta criada com sucesso.',
        data: newConsulta
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Erro inesperado na criação de consulta:', error)
    
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