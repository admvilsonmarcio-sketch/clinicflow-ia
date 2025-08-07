import { createClient } from '@/lib/supabase/client'

// Nome do bucket para documentos de pacientes
export const DOCUMENTS_BUCKET = 'documentos-pacientes'

// Configuração do storage
export const storageConfig = {
  bucketName: DOCUMENTS_BUCKET,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
}

// Função para fazer upload de arquivo
export async function uploadDocument(
  file: File,
  pacienteId: string,
  clinicaId: string
): Promise<{ url: string; path: string }> {
  const supabase = createClient()
  
  // Gerar nome único para o arquivo
  const timestamp = Date.now()
  const fileExtension = file.name.split('.').pop()
  const fileName = `${pacienteId}_${timestamp}.${fileExtension}`
  const filePath = `${clinicaId}/${pacienteId}/${fileName}`
  
  // Upload do arquivo
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    throw new Error(`Erro no upload: ${error.message}`)
  }
  
  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from(DOCUMENTS_BUCKET)
    .getPublicUrl(filePath)
  
  return {
    url: urlData.publicUrl,
    path: filePath
  }
}

// Função para deletar arquivo
export async function deleteDocument(filePath: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([filePath])
  
  if (error) {
    throw new Error(`Erro ao deletar arquivo: ${error.message}`)
  }
}

// Função para criar bucket (deve ser executada uma vez)
export async function createDocumentsBucket(): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.storage.createBucket(DOCUMENTS_BUCKET, {
    public: true,
    allowedMimeTypes: storageConfig.allowedTypes,
    fileSizeLimit: storageConfig.maxFileSize
  })
  
  if (error && !error.message.includes('already exists')) {
    throw new Error(`Erro ao criar bucket: ${error.message}`)
  }
}
