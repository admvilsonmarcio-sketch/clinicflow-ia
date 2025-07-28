'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase'
import { uploadDocument } from '@/lib/storage/supabase-storage'
import { DocumentoPaciente, NovoDocumentoPaciente, CATEGORIAS_DOCUMENTO, TIPOS_ARQUIVO_ACEITOS, TAMANHO_MAXIMO_ARQUIVO } from '@/types/documento'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DocumentUploadProps {
  pacienteId: string
  onDocumentUploaded?: (documento: DocumentoPaciente) => void
}

export function DocumentUpload({ pacienteId, onDocumentUploaded }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [categoria, setCategoria] = useState<string>('outro')
  const [descricao, setDescricao] = useState('')
  const [dataDocumento, setDataDocumento] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!TIPOS_ARQUIVO_ACEITOS.includes(file.type as any)) {
      toast({
        title: 'Tipo de arquivo não suportado',
        description: 'Por favor, selecione um arquivo PDF, imagem (JPG, PNG, WEBP) ou documento Word.',
        variant: 'destructive'
      })
      return
    }

    // Validar tamanho do arquivo
    if (file.size > TAMANHO_MAXIMO_ARQUIVO) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB.',
        variant: 'destructive'
      })
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo para upload.',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)

    try {
      // 1. Obter dados do usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // 2. Obter clínica do usuário
      console.log('Buscando perfil para user.id:', user.id)
      
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('clinica_id')
        .eq('id', user.id)
        .single()

      console.log('Resultado da busca do perfil:', { perfil, perfilError })

      if (perfilError) {
        throw new Error(`Erro ao buscar perfil: ${perfilError.message}`)
      }

      if (!perfil?.clinica_id) {
        throw new Error('Clínica não encontrada no perfil')
      }

      // 3. Upload do arquivo usando a função de storage
      const { url } = await uploadDocument(selectedFile, pacienteId, perfil.clinica_id)

      // 4. Salvar informações do documento no banco
      const novoDocumento: NovoDocumentoPaciente = {
        paciente_id: pacienteId,
        nome_arquivo: selectedFile.name,
        tipo_arquivo: selectedFile.type,
        tamanho_arquivo: selectedFile.size,
        url_arquivo: url,
        categoria: categoria as any,
        descricao: descricao || undefined,
        data_documento: dataDocumento || undefined
      }

      // Debug: verificar dados antes do insert
      const dadosInsert = {
        ...novoDocumento,
        clinica_id: perfil.clinica_id,
        criado_por: user.id
      }
      
      console.log('Dados para insert:', dadosInsert)
      console.log('User ID:', user.id)
      console.log('Clinica ID:', perfil.clinica_id)

      const { data: documento, error: dbError } = await supabase
        .from('documentos_pacientes')
        .insert(dadosInsert)
        .select()
        .single()

      if (dbError) {
        throw new Error(`Erro ao salvar documento: ${dbError.message}`)
      }

      toast({
        title: 'Documento enviado com sucesso!',
        description: `O arquivo "${selectedFile.name}" foi enviado e salvo.`,
        variant: 'success'
      })

      // Limpar formulário
      setSelectedFile(null)
      setCategoria('outro')
      setDescricao('')
      setDataDocumento('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Callback para atualizar lista de documentos
      if (onDocumentUploaded) {
        onDocumentUploaded(documento)
      }

    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Upload className="h-5 w-5" />
        Upload de Documentos
      </div>

      <div className="space-y-4">
        {/* Seleção de arquivo */}
        <div>
          <Label htmlFor="file-upload">Selecionar Arquivo</Label>
          <Input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            disabled={uploading}
            className="cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos aceitos: PDF, JPG, PNG, WEBP, DOC, DOCX (máx. 10MB)
          </p>
        </div>

        {/* Arquivo selecionado */}
        {selectedFile && (
          <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeSelectedFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Categoria */}
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria} disabled={uploading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS_DOCUMENTO.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data do documento */}
        <div>
          <Label htmlFor="data-documento">Data do Documento (opcional)</Label>
          <Input
            id="data-documento"
            type="date"
            value={dataDocumento}
            onChange={(e) => setDataDocumento(e.target.value)}
            disabled={uploading}
          />
        </div>

        {/* Descrição */}
        <div>
          <Label htmlFor="descricao">Descrição (opcional)</Label>
          <Input
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição do documento..."
            disabled={uploading}
          />
        </div>

        {/* Botão de upload */}
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Enviar Documento
            </>
          )}
        </Button>
      </div>
    </div>
  )
}