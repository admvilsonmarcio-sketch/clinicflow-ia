
import { NextRequest, NextResponse } from 'next/server'
import { withMedicalAuth } from '@/lib/auth/permissions'
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
  
  try {
    // Validar parâmetros
    const paramValidation = idParamSchema.safeParse(params)
    if (!paramValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters',
          details: paramValidation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { id } = paramValidation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    const { data: clinica, error } = await supabase
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
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: 'Not found',
            message: 'Clínica não encontrada.'
          },
          { status: 404 }
        )
      }
      
      console.error('Erro ao buscar clínica:', error)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao buscar clínica.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ data: clinica })
    
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
  
  try {
    // Validar parâmetros
    const paramValidation = idParamSchema.safeParse(params)
    if (!paramValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters',
          details: paramValidation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { id } = paramValidation.data
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = clinicaUpdateSchema.safeParse({ ...body, id })
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
    
    const { id: _, ...clinicaData } = validation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar se a clínica existe
    const { data: existingClinica, error: checkError } = await supabase
      .from('clinicas')
      .select('id')
      .eq('id', id)
      .single()
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: 'Not found',
            message: 'Clínica não encontrada.'
          },
          { status: 404 }
        )
      }
      
      console.error('Erro ao verificar clínica existente:', checkError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao verificar clínica.'
        },
        { status: 500 }
      )
    }
    
    // Verificar se outro registro já usa o mesmo nome (se nome for alterado)
    if (clinicaData.nome) {
      const { data: nameConflict } = await supabase
        .from('clinicas')
        .select('id')
        .eq('nome', clinicaData.nome)
        .neq('id', id)
        .single()
      
      if (nameConflict) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Já existe uma clínica com este nome.'
          },
          { status: 409 }
        )
      }
    }
    
    // Atualizar clínica
    const { data: updatedClinica, error: updateError } = await supabase
      .from('clinicas')
      .update(clinicaData)
      .eq('id', id)
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
    
    return NextResponse.json(
      { 
        message: 'Clínica atualizada com sucesso.',
        data: updatedClinica
      }
    )
    
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

// DELETE /api/clinicas/[id] - Excluir clínica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withMedicalAuth(request, ['clinicas:delete'])
  if (authResult.error) return authResult.error
  
  try {
    // Validar parâmetros
    const paramValidation = idParamSchema.safeParse(params)
    if (!paramValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters',
          details: paramValidation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { id } = paramValidation.data
    const supabase = createRouteHandlerSupabaseClient()
    
    // Verificar se a clínica existe e se possui dependências
    const { data: dependencias, error: depError } = await supabase
      .from('perfis')
      .select('id')
      .eq('clinica_id', id)
      .limit(1)
    
    if (depError) {
      console.error('Erro ao verificar dependências:', depError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao verificar dependências da clínica.'
        },
        { status: 500 }
      )
    }
    
    if (dependencias && dependencias.length > 0) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Não é possível excluir a clínica pois possui usuários vinculados.'
        },
        { status: 409 }
      )
    }
    
    // Excluir clínica
    const { error: deleteError } = await supabase
      .from('clinicas')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Erro ao excluir clínica:', deleteError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Erro ao excluir clínica.'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: 'Clínica excluída com sucesso.' },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Erro inesperado na exclusão de clínica:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Erro interno do servidor.'
      },
      { status: 500 }
    )
  }
}
