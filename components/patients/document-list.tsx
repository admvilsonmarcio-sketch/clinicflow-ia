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
      return <FileText className="size-5 text-red-500" />
    }
    if (tipoArquivo.includes('image')) {
      return <FileText className="size-5 text-green-500" />
    }
    if (tipoArquivo.includes('word') || tipoArquivo.includes('document')) {
      return <FileText className="size-5 text-blue-500" />
    }
    return <FileText className="size-5 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="size-6 animate-spin" />
        <span className="ml-2">Carregando documentos...</span>
      </div>
    )
  }

  if (documentos.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <FileText className="mx-auto mb-4 size-12 text-gray-300" />
        <p>Nenhum documento encontrado para este paciente.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <FileText className="size-5" />
          Documentos ({documentos.length})
        </div>
      )}

      <div className={compact ? "space-y-2" : "space-y-3"}>
        {documentos.map((documento) => (
          <div key={documento.id} className={`rounded-lg border ${compact ? 'p-3' : 'p-4'} bg-white transition-colors hover:bg-gray-50`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-1 items-start gap-2 min-w-0">
                <div className="shrink-0">
                  {getFileIcon(documento.tipo_arquivo)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={`truncate font-medium text-gray-900 break-words ${compact ? 'text-sm' : ''}`}>
                    {documento.nome_arquivo}
                  </h4>
                  <div className={`mt-1 flex flex-wrap items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 whitespace-nowrap">
                      {getCategoriaLabel(documento.categoria)}
                    </span>
                    <span className="whitespace-nowrap">{formatFileSize(documento.tamanho_arquivo)}</span>
                    {!compact && (
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="size-3" />
                        <span className="hidden sm:inline">{format(new Date(documento.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                        <span className="sm:hidden">{format(new Date(documento.criado_em), 'dd/MM/yy', { locale: ptBR })}</span>
                      </div>
                    )}
                  </div>
                  {!compact && documento.descricao && (
                    <p className="mt-2 text-sm text-gray-600 break-words line-clamp-2">{documento.descricao}</p>
                  )}
                  {!compact && documento.data_documento && (
                    <p className="mt-1 text-sm text-gray-500 break-words">
                      Data do documento: {format(new Date(documento.data_documento), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {showDownload && (
                  <Button
                    type="button"
                    variant="outline"
                    size={compact ? "sm" : "sm"}
                    onClick={() => handleDownload(documento)}
                    title="Visualizar/Baixar"
                    className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                  >
                    {compact ? <Download className="size-3" /> : <Eye className="size-4" />}
                    <span className="sr-only sm:not-sr-only sm:ml-2">{compact ? "Download" : "Ver"}</span>
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
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 sm:h-9 sm:w-auto sm:px-3"
                  >
                    {deletingId === documento.id ? (
                      <Loader2 className={`${compact ? "size-3" : "size-4"} animate-spin`} />
                    ) : (
                      <Trash2 className={compact ? "size-3" : "size-4"} />
                    )}
                    <span className="sr-only sm:not-sr-only sm:ml-2">Excluir</span>
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
