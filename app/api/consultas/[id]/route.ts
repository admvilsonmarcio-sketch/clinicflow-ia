import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth } from '@/lib/auth/permissions'
import { consultaUpdateSchema, idParamSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/consultas/[id] - Buscar consulta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['consultas:read'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da consulta inválido.'
        },
        { status: 400 }
      )
    }
    
    const consultaId = idValidation.data.id
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar consulta com dados relacionados
    const { data: consulta, error } = await supabase
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
        criado_em,
        atualizado_em,
        pacientes(id, nome_completo, email, telefone_celular, cpf, data_nascimento),
        perfis!medico_id(id, nome_completo, cargo, email),
        clinicas(id, nome, endereco, telefone)
      `)
      .eq('id', consultaId)
      .single()
    
    if (error || !consulta) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Consulta não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta consulta
    const canAccess = user.role === 'admin' || 
                     (user.role === 'medico' && consulta.medico_id === user.id) ||
                     (user.role === 'paciente' && consulta.paciente_id === user.id)
    
    if (!canAccess) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar esta consulta.'
        },
        { status: 403 }
      )
    }
    
    return NextResponse.json({ data: consulta })
    
  } catch (error) {
    console.error('Erro inesperado ao buscar consulta:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// PUT /api/consultas/[id] - Atualizar consulta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['consultas:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da consulta inválido.'
        },
        { status: 400 }
      )
    }
    
    const consultaId = idValidation.data.id
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = consultaUpdateSchema.safeParse(body)
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
    
    // Buscar consulta existente
    const { data: existingConsulta, error: fetchError } = await supabase
      .from('consultas')
      .select('*')
      .eq('id', consultaId)
      .single()
    
    if (fetchError || !existingConsulta) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Consulta não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta consulta
    const canAccess = user.role === 'admin' || 
                     (user.role === 'medico' && existingConsulta.medico_id === user.id) ||
                     (user.role === 'paciente' && existingConsulta.paciente_id === user.id)
    
    if (!canAccess) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para atualizar esta consulta.'
        },
        { status: 403 }
      )
    }
    
    // Se está alterando data/hora ou médico, verificar conflitos
    if (updateData.data_consulta || updateData.medico_id || updateData.duracao_minutos) {
      const novaDataConsulta = updateData.data_consulta ? new Date(updateData.data_consulta) : new Date(existingConsulta.data_consulta)
      const novoMedicoId = updateData.medico_id || existingConsulta.medico_id
      const novaDuracao = updateData.duracao_minutos || existingConsulta.duracao_minutos
      
      const inicioConsulta = new Date(novaDataConsulta.getTime() - (15 * 60 * 1000)) // 15 min antes
      const fimConsulta = new Date(novaDataConsulta.getTime() + (novaDuracao * 60 * 1000) + (15 * 60 * 1000)) // duração + 15 min depois
      
      const { data: conflitos, error: conflitosError } = await supabase
        .from('consultas')
        .select('id, data_consulta, duracao_minutos')
        .eq('medico_id', novoMedicoId)
        .in('status', ['agendada', 'confirmada', 'em_andamento'])
        .gte('data_consulta', inicioConsulta.toISOString())
        .lte('data_consulta', fimConsulta.toISOString())
        .neq('id', consultaId) // Excluir a própria consulta
      
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
    }
    
    // Se está alterando o médico, verificar se ele existe e pertence à clínica
    if (updateData.medico_id && updateData.medico_id !== existingConsulta.medico_id) {
      const { data: medico, error: medicoError } = await supabase
        .from('perfis')
        .select('id, clinica_id, nome_completo, cargo')
        .eq('id', updateData.medico_id)
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
      
      if (medico.clinica_id !== existingConsulta.clinica_id) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Médico não pertence à mesma clínica da consulta.'
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
    }
    
    // Atualizar consulta
    const { data: updatedConsulta, error: updateError } = await supabase
      .from('consultas')
      .update({
        ...updateData,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', consultaId)
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
        criado_em,
        atualizado_em,
        pacientes(id, nome_completo, email, telefone_celular),
        perfis!medico_id(id, nome_completo, cargo)
      `)
      .single()
    
    if (updateError) {
      console.error('Erro ao atualizar consulta:', updateError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao atualizar consulta.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Consulta atualizada com sucesso.',
      data: updatedConsulta
    })
    
  } catch (error) {
    console.error('Erro inesperado na atualização de consulta:', error)
    
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

// DELETE /api/consultas/[id] - Deletar consulta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['consultas:delete'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da consulta inválido.'
        },
        { status: 400 }
      )
    }
    
    const consultaId = idValidation.data.id
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar consulta existente
    const { data: existingConsulta, error: fetchError } = await supabase
      .from('consultas')
      .select('*')
      .eq('id', consultaId)
      .single()
    
    if (fetchError || !existingConsulta) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Consulta não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar esta consulta
    const canAccess = user.role === 'admin' || 
                     (user.role === 'medico' && existingConsulta.medico_id === user.id) ||
                     (user.role === 'paciente' && existingConsulta.paciente_id === user.id)
    
    if (!canAccess) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para deletar esta consulta.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se a consulta pode ser deletada (não pode estar em andamento ou concluída)
    if (existingConsulta.status === 'em_andamento' || existingConsulta.status === 'concluida') {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Não é possível deletar consultas em andamento ou concluídas.'
        },
        { status: 409 }
      )
    }
    
    // Nota: Conversas não estão mais diretamente associadas a consultas
    // A verificação de dependências foi removida pois a relação foi alterada
    
    // Deletar consulta
    const { error: deleteError } = await supabase
      .from('consultas')
      .delete()
      .eq('id', consultaId)
    
    if (deleteError) {
      console.error('Erro ao deletar consulta:', deleteError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao deletar consulta.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Consulta deletada com sucesso.'
    })
    
  } catch (error) {
    console.error('Erro inesperado na deleção de consulta:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}