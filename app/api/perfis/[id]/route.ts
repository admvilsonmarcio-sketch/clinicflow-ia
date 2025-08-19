import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth, canAccessClinica } from '@/lib/auth/permissions'
import { perfilUpdateSchema, idParamSchema } from '@/lib/validations/schemas'
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// GET /api/perfis/[id] - Buscar perfil por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['perfis:read'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID do perfil inválido.'
        },
        { status: 400 }
      )
    }
    
    const perfilId = idValidation.data.id
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar perfil com dados da clínica
    const { data: perfil, error } = await supabase
      .from('perfis')
      .select(`
        id,
        nome_completo,
        email,
        telefone_celular,
        cargo,
        clinica_id,
        ativo,
        criado_em,
        atualizado_em,
        clinicas!inner(id, nome, endereco, telefone_celular)
      `)
      .eq('id', perfilId)
      .single()
    
    if (error || !perfil) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Perfil não encontrado.'
        },
        { status: 404 }
      )
    }
    
    // Verificar se o usuário pode acessar este perfil
    // Usuários podem ver seu próprio perfil, admins podem ver perfis da sua clínica
    const canAccess = 
      user.id === perfilId || // Próprio perfil
      canAccessClinica(user, perfil.clinica_id) || // Mesma clínica
      user.role === 'super_admin' // Super admin vê tudo
    
    if (!canAccess) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para acessar este perfil.'
        },
        { status: 403 }
      )
    }
    
    // Buscar estatísticas se for um médico e o usuário tiver permissão
    let stats = null
    if (perfil.cargo === 'medico' && (user.role === 'admin' || user.role === 'super_admin' || user.id === perfilId)) {
      const [consultasCount, consultasHoje, consultasSemana] = await Promise.all([
        supabase
          .from('consultas')
          .select('id', { count: 'exact', head: true })
          .eq('medico_id', perfilId),
        supabase
          .from('consultas')
          .select('id', { count: 'exact', head: true })
          .eq('medico_id', perfilId)
          .gte('data_consulta', new Date().toISOString().split('T')[0])
          .lt('data_consulta', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        supabase
          .from('consultas')
          .select('id', { count: 'exact', head: true })
          .eq('medico_id', perfilId)
          .gte('data_consulta', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ])
      
      stats = {
        total_consultas: consultasCount.count || 0,
        consultas_hoje: consultasHoje.count || 0,
        consultas_semana: consultasSemana.count || 0
      }
    }
    
    return NextResponse.json({ 
      data: {
        ...perfil,
        stats
      }
    })
    
  } catch (error) {
    console.error('Erro inesperado ao buscar perfil:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}

// PUT /api/perfis/[id] - Atualizar perfil
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['perfis:write'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID do perfil inválido.'
        },
        { status: 400 }
      )
    }
    
    const perfilId = idValidation.data.id
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = perfilUpdateSchema.safeParse(body)
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
    
    // Buscar perfil existente
    const { data: existingPerfil, error: fetchError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', perfilId)
      .single()
    
    if (fetchError || !existingPerfil) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Perfil não encontrado.'
        },
        { status: 404 }
      )
    }
    
    // Verificar permissões de acesso
    const canEdit = 
      user.id === perfilId || // Próprio perfil (dados básicos)
      canAccessClinica(user, existingPerfil.clinica_id) || // Admin da mesma clínica
      user.role === 'super_admin' // Super admin edita tudo
    
    if (!canEdit) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para atualizar este perfil.'
        },
        { status: 403 }
      )
    }
    
    // Verificar permissões específicas para campos sensíveis
    const isSelfEdit = user.id === perfilId
    const isAdmin = user.role === 'admin' || user.role === 'super_admin'
    
    // Usuários comuns só podem editar dados básicos do próprio perfil
    if (isSelfEdit && !isAdmin) {
      const allowedFields = ['nome_completo', 'telefone_celular']
      const restrictedFields = Object.keys(updateData).filter(field => !allowedFields.includes(field))
      
      if (restrictedFields.length > 0) {
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: `Você não pode alterar os campos: ${restrictedFields.join(', ')}.`
          },
          { status: 403 }
        )
      }
    }
    
    // Verificar permissões para alteração de cargo
    if (updateData.cargo && updateData.cargo !== existingPerfil.cargo) {
      // Apenas admins podem alterar cargos
      if (!isAdmin) {
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: 'Você não tem permissão para alterar cargos.'
          },
          { status: 403 }
        )
      }
      
      // Apenas super_admins podem criar/alterar para super_admin
      if (updateData.cargo === 'super_admin' && user.role !== 'super_admin') {
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: 'Apenas super administradores podem alterar para super administrador.'
          },
          { status: 403 }
        )
      }
      
      // Não pode alterar o próprio cargo
      if (user.id === perfilId) {
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: 'Você não pode alterar seu próprio cargo.'
          },
          { status: 403 }
        )
      }
    }
    
    // Verificar conflitos de e-mail se estiver sendo alterado
    if (updateData.email && updateData.email !== existingPerfil.email) {
      const { data: conflictEmail, error: emailCheckError } = await supabase
        .from('perfis')
        .select('id, email')
        .eq('email', updateData.email)
        .neq('id', perfilId)
        .single()
      
      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        console.error('Erro ao verificar e-mail:', emailCheckError)
        return NextResponse.json(
          { 
            error: 'Database error',
            message: 'Erro ao verificar dados do usuário.'
          },
          { status: 500 }
        )
      }
      
      if (conflictEmail) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Já existe um usuário cadastrado com este e-mail.'
          },
          { status: 409 }
        )
      }
    }
    
    // CRM removido - campo não existe na tabela perfis
    
    // Atualizar perfil
    const { data: updatedPerfil, error: updateError } = await supabase
      .from('perfis')
      .update({
        ...updateData,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', perfilId)
      .select(`
        id,
        nome_completo,
        email,
        telefone_celular,
        cargo,
        clinica_id,
        ativo,
        criado_em,
        atualizado_em,
        clinicas!inner(id, nome)
      `)
      .single()
    
    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao atualizar perfil.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Perfil atualizado com sucesso.',
      data: updatedPerfil
    })
    
  } catch (error) {
    console.error('Erro inesperado na atualização de perfil:', error)
    
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

// DELETE /api/perfis/[id] - Deletar perfil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['perfis:delete'])
  if (authResult.error) return authResult.error
  
  const { user } = authResult
  
  try {
    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid ID',
          message: 'ID do perfil inválido.'
        },
        { status: 400 }
      )
    }
    
    const perfilId = idValidation.data.id
    
    // Não pode deletar o próprio perfil
    if (user.id === perfilId) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não pode deletar seu próprio perfil.'
        },
        { status: 403 }
      )
    }
    
    const supabase = createRouteHandlerSupabaseClient()
    
    // Buscar perfil existente
    const { data: existingPerfil, error: fetchError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', perfilId)
      .single()
    
    if (fetchError || !existingPerfil) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Perfil não encontrado.'
        },
        { status: 404 }
      )
    }
    
    // Verificar permissões
    const canDelete = 
      canAccessClinica(user, existingPerfil.clinica_id) || // Admin da mesma clínica
      user.role === 'super_admin' // Super admin deleta tudo
    
    if (!canDelete) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Você não tem permissão para deletar este perfil.'
        },
        { status: 403 }
      )
    }
    
    // Apenas super_admins podem deletar outros super_admins
    if (existingPerfil.cargo === 'super_admin' && user.role !== 'super_admin') {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Apenas super administradores podem deletar outros super administradores.'
        },
        { status: 403 }
      )
    }
    
    // Verificar se existem dependências (consultas como médico)
    if (existingPerfil.cargo === 'medico') {
      const { data: consultas, error: consultasError } = await supabase
        .from('consultas')
        .select('id')
        .eq('medico_id', perfilId)
        .limit(1)
      
      if (consultasError) {
        console.error('Erro ao verificar consultas do médico:', consultasError)
        return NextResponse.json(
          { 
            error: 'Database error',
            message: 'Erro ao verificar dependências do perfil.'
          },
          { status: 500 }
        )
      }
      
      if (consultas && consultas.length > 0) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Não é possível deletar médico com consultas associadas. Transfira ou cancele as consultas primeiro.'
          },
          { status: 409 }
        )
      }
    }
    
    // Deletar perfil
    const { error: deleteError } = await supabase
      .from('perfis')
      .delete()
      .eq('id', perfilId)
    
    if (deleteError) {
      console.error('Erro ao deletar perfil:', deleteError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao deletar perfil.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Perfil deletado com sucesso.'
    })
    
  } catch (error) {
    console.error('Erro inesperado na deleção de perfil:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}