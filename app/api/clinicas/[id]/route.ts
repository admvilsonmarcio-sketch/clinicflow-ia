import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth, canAccessClinica } from '@/lib/auth/permissions'
import { clinicaUpdateSchema, idParamSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/clinicas/[id] - Buscar clínica por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['clinicas:read'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da clínica inválido.'
        },
        { status: 400 }
      )
    }
    
    const clinicaId = idValidation.data.id
    
    // Verificar se o usuário pode acessar esta clínica
    if (!canAccessClinica(user, clinicaId)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar esta clínica.'
        },
        { status: 403 }
      )
    }
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar clínica com estatísticas
    const { data: clinica, error } = await supabase
      .from('clinicas')
      .select(`
        id,
        nome,
        cnpj,
        endereco,
        telefone_celular,
        email,
        site,
        especialidades,
        horario_funcionamento,
        ativa,
        criado_em,
        atualizado_em
      `)
      .eq('id', clinicaId)
      .single()
    
    if (error || !clinica) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Clínica não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Buscar estatísticas da clínica (apenas se o usuário tiver permissão)
    let stats = null
    if (user.role === 'admin' || user.role === 'super_admin') {
      const [patientsCount, consultasCount, medicosCount] = await Promise.all([
        supabase
          .from('pacientes')
          .select('id', { count: 'exact', head: true })
          .eq('clinica_id', clinicaId),
        supabase
          .from('consultas')
          .select('id', { count: 'exact', head: true })
          .eq('clinica_id', clinicaId),
        supabase
          .from('perfis')
          .select('id', { count: 'exact', head: true })
          .eq('clinica_id', clinicaId)
          .eq('cargo', 'medico')
      ])
      
      stats = {
        total_pacientes: patientsCount.count || 0,
        total_consultas: consultasCount.count || 0,
        total_medicos: medicosCount.count || 0
      }
    }
    
    return NextResponse.json({ 
      data: {
        ...clinica,
        stats
      }
    })
    
  } catch (error) {
    console.error('Erro inesperado ao buscar clínica:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// PUT /api/clinicas/[id] - Atualizar clínica
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['clinicas:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da clínica inválido.'
        },
        { status: 400 }
      )
    }
    
    const clinicaId = idValidation.data.id
    
    // Verificar se o usuário pode acessar esta clínica
    if (!canAccessClinica(user, clinicaId)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para atualizar esta clínica.'
        },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = clinicaUpdateSchema.safeParse(body)
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
    
    // Buscar clínica existente
    const { data: existingClinica, error: fetchError } = await supabase
      .from('clinicas')
      .select('*')
      .eq('id', clinicaId)
      .single()
    
    if (fetchError || !existingClinica) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Clínica não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar conflitos de CNPJ se estiver sendo alterado
    if (updateData.cnpj && updateData.cnpj !== existingClinica.cnpj) {
      const { data: conflictClinica, error: cnpjCheckError } = await supabase
        .from('clinicas')
        .select('id, cnpj')
        .eq('cnpj', updateData.cnpj)
        .neq('id', clinicaId)
        .single()
      
      if (cnpjCheckError && cnpjCheckError.code !== 'PGRST116') {
        console.error('Erro ao verificar CNPJ:', cnpjCheckError)
        return NextResponse.json(
          { 
            error: 'Database error',
            message: 'Erro ao verificar dados da clínica.'
          },
          { status: 500 }
        )
      }
      
      if (conflictClinica) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Já existe uma clínica cadastrada com este CNPJ.'
          },
          { status: 409 }
        )
      }
    }
    
    // Verificar conflitos de e-mail se estiver sendo alterado
    if (updateData.email && updateData.email !== existingClinica.email) {
      const { data: conflictEmail, error: emailCheckError } = await supabase
        .from('clinicas')
        .select('id, email')
        .eq('email', updateData.email)
        .neq('id', clinicaId)
        .single()
      
      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        console.error('Erro ao verificar e-mail:', emailCheckError)
        return NextResponse.json(
          { 
            error: 'Database error',
            message: 'Erro ao verificar dados da clínica.'
          },
          { status: 500 }
        )
      }
      
      if (conflictEmail) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Já existe uma clínica cadastrada com este e-mail.'
          },
          { status: 409 }
        )
      }
    }
    
    // Atualizar clínica
    const { data: updatedClinica, error: updateError } = await supabase
      .from('clinicas')
      .update({
        ...updateData,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', clinicaId)
      .select(`
        id,
        nome,
        cnpj,
        endereco,
        telefone_celular,
        email,
        site,
        especialidades,
        horario_funcionamento,
        ativa,
        criado_em,
        atualizado_em
      `)
      .single()
    
    if (updateError) {
      console.error('Erro ao atualizar clínica:', updateError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao atualizar clínica.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Clínica atualizada com sucesso.',
      data: updatedClinica
    })
    
  } catch (error) {
    console.error('Erro inesperado na atualização de clínica:', error)
    
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

// DELETE /api/clinicas/[id] - Deletar clínica (apenas super_admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['clinicas:delete'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  // Apenas super admins podem deletar clínicas
  if (user.role !== 'super_admin') {
    return NextResponse.json(
      { 
        error: 'Forbidden',
        message: 'Apenas super administradores podem deletar clínicas.'
      },
      { status: 403 }
    )
  }
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID da clínica inválido.'
        },
        { status: 400 }
      )
    }
    
    const clinicaId = idValidation.data.id
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar clínica existente
    const { data: existingClinica, error: fetchError } = await supabase
      .from('clinicas')
      .select('*')
      .eq('id', clinicaId)
      .single()
    
    if (fetchError || !existingClinica) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Clínica não encontrada.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se existem dependências (pacientes, consultas, usuários)
    const [pacientes, consultas, usuarios] = await Promise.all([
      supabase
        .from('pacientes')
        .select('id')
        .eq('clinica_id', clinicaId)
        .limit(1),
      supabase
        .from('consultas')
        .select('id')
        .eq('clinica_id', clinicaId)
        .limit(1),
      supabase
        .from('perfis')
        .select('id')
        .eq('clinica_id', clinicaId)
        .limit(1)
    ])
    
    if (pacientes.error || consultas.error || usuarios.error) {
      console.error('Erro ao verificar dependências:', { 
        pacientes: pacientes.error, 
        consultas: consultas.error, 
        usuarios: usuarios.error 
      })
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao verificar dependências da clínica.'
        },
        { status: 500 }
      )
    }
    
    const hasDependencies = [
      { name: 'pacientes', data: pacientes.data },
      { name: 'consultas', data: consultas.data },
      { name: 'usuários', data: usuarios.data }
    ].filter(dep => dep.data && dep.data.length > 0)
    
    if (hasDependencies.length > 0) {
      const dependencyNames = hasDependencies.map(dep => dep.name).join(', ')
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: `Não é possível deletar clínica com ${dependencyNames} associados. Remova todas as dependências primeiro.`
        },
        { status: 409 }
      )
    }
    
    // Deletar clínica
    const { error: deleteError } = await supabase
      .from('clinicas')
      .delete()
      .eq('id', clinicaId)
    
    if (deleteError) {
      console.error('Erro ao deletar clínica:', deleteError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao deletar clínica.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Clínica deletada com sucesso.'
    })
    
  } catch (error) {
    console.error('Erro inesperado na deleção de clínica:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}