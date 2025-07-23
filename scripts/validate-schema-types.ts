/**
 * Script para validar se os types TypeScript batem com o schema real do banco
 * Execução: npx tsx scripts/validate-schema-types.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configuração do Supabase (usar variáveis de ambiente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente do Supabase não configuradas')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface SchemaValidationResult {
    table: string
    status: 'OK' | 'ERROR'
    issues: string[]
}

/**
 * Valida se uma tabela existe no banco
 */
async function validateTableExists(tableName: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)

        return !error
    } catch {
        return false
    }
}

/**
 * Obtém as colunas de uma tabela do banco
 */
async function getTableColumns(tableName: string): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .rpc('get_table_columns', { table_name: tableName })

        if (error) {
            console.warn(`⚠️ Não foi possível obter colunas de ${tableName}:`, error.message)
            return []
        }

        return data || []
    } catch (error) {
        console.warn(`⚠️ Erro ao obter colunas de ${tableName}:`, error)
        return []
    }
}

/**
 * Lê e analisa o arquivo types/database.ts
 */
function parseTypesFile(): Record<string, string[]> {
    const typesPath = path.join(process.cwd(), 'types/database.ts')

    if (!fs.existsSync(typesPath)) {
        console.error('❌ Arquivo types/database.ts não encontrado')
        process.exit(1)
    }

    const content = fs.readFileSync(typesPath, 'utf-8')
    const tables: Record<string, string[]> = {}

    // Regex simples para extrair nomes de campos (pode ser melhorada)
    const tableMatches = content.match(/(\w+):\s*{[\s\S]*?Row:\s*{([\s\S]*?)}/g)

    if (tableMatches) {
        tableMatches.forEach(match => {
            const tableNameMatch = match.match(/(\w+):\s*{/)
            const fieldsMatch = match.match(/Row:\s*{([\s\S]*?)}/)

            if (tableNameMatch && fieldsMatch) {
                const tableName = tableNameMatch[1]
                const fieldsContent = fieldsMatch[1]

                // Extrair nomes dos campos
                const fieldMatches = fieldsContent.match(/(\w+):/g)
                if (fieldMatches) {
                    tables[tableName] = fieldMatches.map(field => field.replace(':', ''))
                }
            }
        })
    }

    return tables
}

/**
 * Valida uma tabela específica
 */
async function validateTable(tableName: string, typeFields: string[]): Promise<SchemaValidationResult> {
    const result: SchemaValidationResult = {
        table: tableName,
        status: 'OK',
        issues: []
    }

    // Verificar se tabela existe
    const exists = await validateTableExists(tableName)
    if (!exists) {
        result.status = 'ERROR'
        result.issues.push(`Tabela '${tableName}' não existe no banco`)
        return result
    }

    // Obter colunas reais do banco
    const dbColumns = await getTableColumns(tableName)

    if (dbColumns.length === 0) {
        result.issues.push(`Não foi possível obter colunas da tabela '${tableName}'`)
        return result
    }

    // Comparar campos
    const missingInTypes = dbColumns.filter(col => !typeFields.includes(col))
    const extraInTypes = typeFields.filter(field => !dbColumns.includes(field))

    if (missingInTypes.length > 0) {
        result.status = 'ERROR'
        result.issues.push(`Campos faltando nos types: ${missingInTypes.join(', ')}`)
    }

    if (extraInTypes.length > 0) {
        result.status = 'ERROR'
        result.issues.push(`Campos extras nos types: ${extraInTypes.join(', ')}`)
    }

    return result
}

/**
 * Função principal
 */
async function main() {
    console.log('🔍 Validando sincronização entre Schema e Types...\n')

    // Ler types do arquivo
    const typeTables = parseTypesFile()

    if (Object.keys(typeTables).length === 0) {
        console.error('❌ Nenhuma tabela encontrada no arquivo types/database.ts')
        process.exit(1)
    }

    console.log(`📋 Encontradas ${Object.keys(typeTables).length} tabelas nos types\n`)

    // Validar cada tabela
    const results: SchemaValidationResult[] = []

    for (const [tableName, fields] of Object.entries(typeTables)) {
        console.log(`🔍 Validando tabela: ${tableName}`)
        const result = await validateTable(tableName, fields)
        results.push(result)

        if (result.status === 'OK') {
            console.log(`✅ ${tableName}: OK`)
        } else {
            console.log(`❌ ${tableName}: ERRO`)
            result.issues.forEach(issue => console.log(`   - ${issue}`))
        }
        console.log()
    }

    // Resumo final
    const okCount = results.filter(r => r.status === 'OK').length
    const errorCount = results.filter(r => r.status === 'ERROR').length

    console.log('📊 RESUMO:')
    console.log(`✅ Tabelas OK: ${okCount}`)
    console.log(`❌ Tabelas com erro: ${errorCount}`)

    if (errorCount > 0) {
        console.log('\n🚨 AÇÃO NECESSÁRIA:')
        console.log('1. Corrigir os types em types/database.ts')
        console.log('2. Ou atualizar o schema do banco')
        console.log('3. Executar novamente este script')
        process.exit(1)
    } else {
        console.log('\n🎉 Todos os types estão sincronizados com o schema!')
    }
}

// Executar
main().catch(error => {
    console.error('❌ Erro durante validação:', error)
    process.exit(1)
})