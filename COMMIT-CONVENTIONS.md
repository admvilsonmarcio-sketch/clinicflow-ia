# 📝 Convenções de Commit - MediFlow

Guia de boas práticas para commits seguindo padrões internacionais com descrições em português.

## 🎯 Formato Padrão

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

## 📋 Tipos de Commit

### 🚀 Principais
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação (não afeta lógica)
- **refactor**: Refatoração de código
- **test**: Testes
- **chore**: Tarefas de manutenção

### 🔧 Específicos
- **perf**: Melhoria de performance
- **build**: Sistema de build
- **ci**: Integração contínua
- **revert**: Reverter commit anterior

## 🎨 Exemplos Práticos

### ✅ Commits Bem Feitos

```bash
# Nova funcionalidade
git commit -m "feat: adiciona cadastro de pacientes com validação"

# Correção de bug
git commit -m "fix: corrige erro de autenticação no login"

# Documentação
git commit -m "docs: atualiza README com instruções de instalação"

# Estilo/formatação
git commit -m "style: ajusta espaçamento dos componentes UI"

# Refatoração
git commit -m "refactor: reorganiza estrutura de pastas dos componentes"

# Testes
git commit -m "test: adiciona testes para componente de login"

# Manutenção
git commit -m "chore: atualiza dependências do projeto"

# Performance
git commit -m "perf: otimiza queries do banco de dados"

# Build
git commit -m "build: configura Webpack para produção"

# CI/CD
git commit -m "ci: adiciona workflow de deploy automático"
```

### ❌ Commits Ruins

```bash
# Muito vago
git commit -m "fix: correção"

# Sem tipo
git commit -m "adiciona nova tela"

# Em inglês (preferimos português)
git commit -m "feat: add new patient form"

# Muito longo
git commit -m "feat: adiciona nova funcionalidade super complexa que faz muitas coisas diferentes ao mesmo tempo"
```

## 🏥 Contexto MediFlow

### Escopos Sugeridos
- **auth**: Autenticação
- **pacientes**: Gestão de pacientes
- **agenda**: Sistema de agendamentos
- **chat**: Mensagens/conversas
- **ia**: Inteligência artificial
- **config**: Configurações
- **db**: Banco de dados
- **ui**: Interface do usuário

### Exemplos Específicos

```bash
# Funcionalidades por módulo
git commit -m "feat(pacientes): adiciona formulário de cadastro"
git commit -m "feat(agenda): implementa calendário interativo"
git commit -m "feat(chat): integra WhatsApp via EvolutionAPI"
git commit -m "feat(ia): adiciona resposta automática com OpenAI"

# Correções específicas
git commit -m "fix(auth): corrige redirecionamento após login"
git commit -m "fix(db): resolve problema de conexão com Supabase"
git commit -m "fix(ui): ajusta responsividade em dispositivos móveis"

# Melhorias
git commit -m "perf(db): otimiza consultas de pacientes"
git commit -m "style(ui): melhora consistência visual dos botões"
git commit -m "refactor(auth): simplifica lógica de validação"
```

## 🔧 Configuração Automática

### Commitizen (Opcional)
```bash
# Instalar globalmente
npm install -g commitizen cz-conventional-changelog

# Configurar no projeto
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc

# Usar
git cz
```

### Husky + Commitlint
```bash
# Instalar dependências
npm install -D @commitlint/cli @commitlint/config-conventional husky

# Configurar commitlint
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# Configurar husky
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

## 📊 Estatísticas de Commit

### Frequência Recomendada
- **feat**: 40-50% (novas funcionalidades)
- **fix**: 20-30% (correções)
- **docs**: 10-15% (documentação)
- **refactor**: 5-10% (melhorias)
- **style**: 5-10% (formatação)
- **chore**: 5-10% (manutenção)

## 🎯 Dicas Importantes

### ✅ Boas Práticas
1. **Seja específico**: Descreva exatamente o que foi feito
2. **Use imperativo**: "adiciona" não "adicionado"
3. **Limite 50 caracteres**: Para o título
4. **Uma mudança por commit**: Não misture funcionalidades
5. **Teste antes**: Sempre teste antes de commitar

### 🚫 Evite
1. Commits muito grandes
2. Mensagens vagas
3. Misturar tipos diferentes
4. Commits quebrados
5. Informações sensíveis

## 📋 Template de Commit

```bash
# Template básico para copiar/colar
git commit -m "tipo(escopo): descrição clara e objetiva"

# Exemplos prontos para usar:
git commit -m "feat: adiciona [FUNCIONALIDADE]"
git commit -m "fix: corrige [PROBLEMA]"
git commit -m "docs: atualiza [DOCUMENTAÇÃO]"
git commit -m "style: ajusta [VISUAL/FORMATAÇÃO]"
git commit -m "refactor: melhora [CÓDIGO/ESTRUTURA]"
git commit -m "chore: atualiza [DEPENDÊNCIA/CONFIG]"
```

## 🔄 Workflow Recomendado

```bash
# 1. Verificar status
git status

# 2. Adicionar arquivos específicos (preferível ao git add .)
git add arquivo1.tsx arquivo2.ts

# 3. Commit seguindo convenção
git commit -m "feat(pacientes): adiciona validação de CPF"

# 4. Push para branch
git push origin feature/nome-da-branch
```

## 📈 Benefícios

### Para o Projeto
- **Histórico claro** de mudanças
- **Facilita code review**
- **Automatização** de changelogs
- **Melhor rastreabilidade**

### Para a Equipe
- **Comunicação eficiente**
- **Onboarding mais rápido**
- **Debugging facilitado**
- **Releases organizados**

---

**💡 Lembre-se: Um bom commit conta uma história clara do que foi feito!**