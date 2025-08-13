import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth, canAccessPatient } from '@/lib/auth/permissions'
import { patientUpdateSchema, idParamSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: { id: string }
}

// GET /api/patients/[id] - Buscar paciente por ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResult = await withMedicalAuth(request, ['patients:read'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID do parâmetro
    const idValidation = idParamSchema.safeParse({ id: params.id })
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameter',
          message: 'ID do paciente inválido.',
          details: idValidation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { id } = idValidation.data
    
    // Verificar se o usuário pode acessar este paciente
    const hasAccess = await canAccessPatient(user, id)
    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar este paciente.'
        },
        { status: 403 }
      )
    }
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar paciente com dados da clínica
    const { data: patient, error } = await supabase
      .from('pacientes')
      .select(`
        id,
        nome_completo,
        email,
        telefone,
        cpf,
        data_nascimento,
        endereco,
        cep,
        cidade,
        estado,
        observacoes,
        clinica_id,
        created_at,
        updated_at,
        clinicas!inner(id, nome, endereco, telefone)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: 'Not found',
            message: 'Paciente não encontrado.'
          },
          { status: 404 }
        )
      }
      
      console.error('Erro ao buscar paciente:', error)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar paciente.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data: patient })
    
  } catch (error) {
    console.error('Erro inesperado na busca de paciente:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// PUT /api/patients/[id] - Atualizar paciente
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResult = await withMedicalAuth(request, ['patients:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID do parâmetro
    const idValidation = idParamSchema.safeParse({ id: params.id })
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameter',
          message: 'ID do paciente inválido.',
          details: idValidation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { id } = idValidation.data
    
    // Verificar se o usuário pode acessar este paciente
    const hasAccess = await canAccessPatient(user, id)
    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para editar este paciente.'
        },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = patientUpdateSchema.safeParse({ ...body, id })
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
    
    const { id: validatedId, ...updateData } = validation.data
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar se o paciente existe
    const { data: existingPatient, error: fetchError } = await supabase
      .from('pacientes')
      .select('id, email, cpf, clinica_id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: 'Not found',
            message: 'Paciente não encontrado.'
          },
          { status: 404 }
        )
      }
      
      console.error('Erro ao buscar paciente para atualização:', fetchError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar paciente.'
        },
        { status: 500 }
      )
    }
    
    // Verificar conflitos de email se estiver sendo alterado
    if (updateData.email && updateData.email !== existingPatient.email) {
      const { data: emailConflict } = await supabase
        .from('pacientes')
        .select('id')
        .eq('email', updateData.email)
        .eq('clinica_id', existingPatient.clinica_id)
        .neq('id', id)
        .single()
      
      if (emailConflict) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Já existe outro paciente com este email nesta clínica.'
          },
          { status: 409 }
        )
      }
    }
    
    // Verificar conflitos de CPF se estiver sendo alterado
    if (updateData.cpf && updateData.cpf !== existingPatient.cpf) {
      const { data: cpfConflict } = await supabase
        .from('pacientes')
        .select('id')
        .eq('cpf', updateData.cpf)
        .eq('clinica_id', existingPatient.clinica_id)
        .neq('id', id)
        .single()
      
      if (cpfConflict) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Já existe outro paciente com este CPF nesta clínica.'
          },
          { status: 409 }
        )
      }
    }
    
    // Atualizar paciente
    const { data: updatedPatient, error: updateError } = await supabase
      .from('pacientes')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        nome_completo,
        email,
        telefone,
        cpf,
        data_nascimento,
        endereco,
        cep,
        cidade,
        estado,
        observacoes,
        clinica_id,
        created_at,
        updated_at
      `)
      .single()
    
    if (updateError) {
      console.error('Erro ao atualizar paciente:', updateError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao atualizar paciente.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Paciente atualizado com sucesso.',
      data: updatedPatient
    })
    
  } catch (error) {
    console.error('Erro inesperado na atualização de paciente:', error)
    
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

// DELETE /api/patients/[id] - Excluir paciente
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResult = await withMedicalAuth(request, ['patients:delete'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID do parâmetro
    const idValidation = idParamSchema.safeParse({ id: params.id })
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameter',
          message: 'ID do paciente inválido.',
          details: idValidation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { id } = idValidation.data
    
    // Verificar se o usuário pode acessar este paciente
    const hasAccess = await canAccessPatient(user, id)
    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para excluir este paciente.'
        },
        { status: 403 }
      )
    }
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar se o paciente existe
    const { data: existingPatient, error: fetchError } = await supabase
      .from('pacientes')
      .select('id, nome_completo')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: 'Not found',
            message: 'Paciente não encontrado.'
          },
          { status: 404 }
        )
      }
      
      console.error('Erro ao buscar paciente para exclusão:', fetchError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar paciente.'
        },
        { status: 500 }
      )
    }
    
    // Verificar se há consultas associadas
    const { data: consultas, error: consultasError } = await supabase
      .from('consultas')
      .select('id')
      .eq('paciente_id', id)
      .limit(1)
    
    if (consultasError) {
      console.error('Erro ao verificar consultas do paciente:', consultasError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao verificar dependências do paciente.'
        },
        { status: 500 }
      )
    }
    
    if (consultas && consultas.length > 0) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Não é possível excluir paciente com consultas associadas. Exclua as consultas primeiro.'
        },
        { status: 409 }
      )
    }
    
    // Verificar se há conversas associadas
    const { data: conversas, error: conversasError } = await supabase
      .from('conversas')
      .select('id')
      .eq('paciente_id', id)
      .limit(1)
    
    if (conversasError) {
      console.error('Erro ao verificar conversas do paciente:', conversasError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao verificar dependências do paciente.'
        },
        { status: 500 }
      )
    }
    
    if (conversas && conversas.length > 0) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Não é possível excluir paciente com conversas associadas. Exclua as conversas primeiro.'
        },
        { status: 409 }
      )
    }
    
    // Excluir paciente
    const { error: deleteError } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Erro ao excluir paciente:', deleteError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao excluir paciente.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: `Paciente "${existingPatient.nome_completo}" excluído com sucesso.`
    })
    
  } catch (error) {
    console.error('Erro inesperado na exclusão de paciente:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}