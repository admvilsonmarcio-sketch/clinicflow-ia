'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { deleteDocument } from '@/lib/supabase/storage'
import { DocumentoPaciente, CATEGORIAS_DOCUMENTO } from '@/types/documento'
import { FileText, Download, Trash2, Eye, Calendar, User, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DocumentListProps {
  pacienteId?: string
  patientId?: string
  refreshTrigger?: number
  showUpload?: boolean
  showDownload?: boolean
  compact?: boolean
}

export function DocumentList({ 
  pacienteId, 
  patientId, 
  refreshTrigger, 
  showUpload = true, 
  showDownload = true, 
  compact = false 
}: DocumentListProps) {
  const finalPatientId = patientId || pacienteId
  const [documentos, setDocumentos] = useState<DocumentoPaciente[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const carregarDocumentos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('documentos_pacientes')
        .select(`
          *
        `)
        .eq('paciente_id', finalPatientId)
        .order('criado_em', { ascending: false })

      if (error) {
        throw new Error(`Erro ao carregar documentos: ${error.message}`)
      }

      setDocumentos(data || [])
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
      toast({
        title: 'Erro ao carregar documentos',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (finalPatientId) {
      carregarDocumentos()
    }
  }, [finalPatientId, refreshTrigger])

  const handleDownload = async (documento: DocumentoPaciente) => {
    try {
      // Abrir o arquivo em uma nova aba
      window.open(documento.url_arquivo, '_blank')
    } catch (error) {
      console.error('Erro ao baixar documento:', error)
      toast({
        title: 'Erro ao baixar documento',
        description: 'Não foi possível baixar o documento.',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (documento: DocumentoPaciente) => {
    if (!confirm(`Tem certeza que deseja excluir o documento "${documento.nome_arquivo}"?`)) {
      return
    }

    try {
      setDeletingId(documento.id)

      // 1. Extrair o caminho do arquivo da URL
      const urlParts = documento.url_arquivo.split('/')
      const bucketIndex = urlParts.findIndex(part => part === 'documentos-pacientes')
      const filePath = urlParts.slice(bucketIndex + 1).join('/')
      
      // Deletar arquivo do storage
      await deleteDocument(filePath)

      // 2. Deletar registro do banco
      const { error: dbError } = await supabase
        .from('documentos_pacientes')
        .delete()
        .eq('id', documento.id)

      if (dbError) {
        throw new Error(`Erro ao deletar documento: ${dbError.message}`)
      }

      toast({
        title: 'Documento excluído',
        description: `O documento "${documento.nome_arquivo}" foi excluído com sucesso.`,
        variant: 'success'
      })

      // Atualizar lista
      await carregarDocumentos()

    } catch (error) {
      console.error('Erro ao deletar documento:', error)
      toast({
        title: 'Erro ao excluir documento',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCategoriaLabel = (categoria: string) => {
    const cat = CATEGORIAS_DOCUMENTO.find(c => c.value === categoria)
    return cat?.label || categoria
  }

  const getFileIcon = (tipoArquivo: string) => {
    if (tipoArquivo.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />
    }
    if (tipoArquivo.includes('image')) {
      return <FileText className="h-5 w-5 text-green-500" />
    }
    if (tipoArquivo.includes('word') || tipoArquivo.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-500" />
    }
    return <FileText className="h-5 w-5 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando documentos...</span>
      </div>
    )
  }

  if (documentos.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Nenhum documento encontrado para este paciente.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FileText className="h-5 w-5" />
          Documentos ({documentos.length})
        </div>
      )}

      <div className={compact ? "space-y-2" : "space-y-3"}>
        {documentos.map((documento) => (
          <div key={documento.id} className={`border rounded-lg ${compact ? 'p-3' : 'p-4'} bg-white hover:bg-gray-50 transition-colors`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getFileIcon(documento.tipo_arquivo)}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium text-gray-900 truncate ${compact ? 'text-sm' : ''}`}>
                    {documento.nome_arquivo}
                  </h4>
                  <div className={`flex flex-wrap items-center gap-4 mt-1 ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {getCategoriaLabel(documento.categoria)}
                    </span>
                    <span>{formatFileSize(documento.tamanho_arquivo)}</span>
                    {!compact && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(documento.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    )}
                  </div>
                  {!compact && documento.descricao && (
                    <p className="text-sm text-gray-600 mt-2">{documento.descricao}</p>
                  )}
                  {!compact && documento.data_documento && (
                    <p className="text-sm text-gray-500 mt-1">
                      Data do documento: {format(new Date(documento.data_documento), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {showDownload && (
                  <Button
                    type="button"
                    variant="outline"
                    size={compact ? "sm" : "sm"}
                    onClick={() => handleDownload(documento)}
                    title="Visualizar/Baixar"
                  >
                    {compact ? <Download className="h-3 w-3" /> : <Eye className="h-4 w-4" />}
                  </Button>
                )}
                {showUpload && (
                  <Button
                    type="button"
                    variant="outline"
                    size={compact ? "sm" : "sm"}
                    onClick={() => handleDelete(documento)}
                    disabled={deletingId === documento.id}
                    title="Excluir"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === documento.id ? (
                      <Loader2 className={`${compact ? "h-3 w-3" : "h-4 w-4"} animate-spin`} />
                    ) : (
                      <Trash2 className={compact ? "h-3 w-3" : "h-4 w-4"} />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
