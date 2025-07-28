# 📚 Como Publicar o MediFlow no GitHub

Guia passo a passo para criar e configurar o repositório no GitHub.

## 🚀 Passo 1: Preparar o Repositório Local

### 1.1 Inicializar Git (se ainda não foi feito)
```bash
git init
```

### 1.2 Adicionar arquivos ao Git
```bash
git add .
git commit -m "feat: setup inicial do projeto MediFlow"
```

## 🌐 Passo 2: Criar Repositório no GitHub

### 2.1 Acessar GitHub
1. Vá para [github.com](https://github.com)
2. Faça login na sua conta
3. Clique no botão **"New"** (ou ícone +)

### 2.2 Configurar Repositório
- **Repository name**: `mediflow`
- **Description**: `🏥 Sistema CRM completo para médicos e clínicas com IA, WhatsApp e automações`
- **Visibility**: 
  - ✅ **Public** (recomendado para portfolio)
  - ⚠️ **Private** (se contém dados sensíveis)
- **Initialize**: 
  - ❌ NÃO marque "Add a README file"
  - ❌ NÃO marque "Add .gitignore"
  - ❌ NÃO marque "Choose a license"
  
### 2.3 Criar Repositório
Clique em **"Create repository"**

## 🔗 Passo 3: Conectar Local com GitHub

### 3.1 Adicionar Remote
```bash
git remote add origin https://github.com/SEU_USUARIO/mediflow.git
```

### 3.2 Configurar Branch Principal
```bash
git branch -M main
```

### 3.3 Push Inicial
```bash
git push -u origin main
```

## ⚙️ Passo 4: Configurar Repositório

### 4.1 Configurar Descrição e Topics
1. Na página do repositório, clique no ⚙️ ao lado de "About"
2. **Description**: `Sistema CRM para médicos com IA, WhatsApp e automações`
3. **Website**: `https://mediflow.vercel.app` (quando fizer deploy)
4. **Topics**: `crm`, `healthcare`, `nextjs`, `supabase`, `whatsapp`, `ai`, `typescript`, `tailwindcss`

### 4.2 Configurar Branch Protection
1. Vá em **Settings** → **Branches**
2. Clique **"Add rule"**
3. **Branch name pattern**: `main`
4. Marque:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

### 4.3 Configurar Issues Templates
1. Vá em **Settings** → **Features**
2. Marque ✅ **Issues**
3. Clique **"Set up templates"**

## 📋 Passo 5: Criar Templates de Issues

### 5.1 Bug Report Template
Crie arquivo `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Reportar um bug ou problema
title: '[BUG] '
labels: bug
assignees: ''
---

## 🐛 Descrição do Bug
Descrição clara e concisa do problema.

## 🔄 Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

## ✅ Comportamento Esperado
O que deveria acontecer.

## 📱 Ambiente
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Versão: [ex: 1.0.0]

## 📸 Screenshots
Se aplicável, adicione screenshots.

## ℹ️ Informações Adicionais
Qualquer outra informação relevante.
```

### 5.2 Feature Request Template
Crie arquivo `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Sugerir uma nova funcionalidade
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## 💡 Descrição da Feature
Descrição clara da funcionalidade desejada.

## 🎯 Problema que Resolve
Qual problema esta feature resolveria?

## 💭 Solução Proposta
Como você imagina que deveria funcionar?

## 🔄 Alternativas Consideradas
Outras soluções que você considerou?

## ℹ️ Informações Adicionais
Contexto adicional, screenshots, etc.
```

## 🔧 Passo 6: Configurar Actions (CI/CD)

### 6.1 Criar Workflow de Build
Crie arquivo `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Build project
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### 6.2 Configurar Secrets
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique **"New repository secret"**
3. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📊 Passo 7: Configurar README Atrativo

Atualize o README.md com badges e informações visuais:

```markdown
# 🏥 MediFlow

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

<div align="center">
  <img src="https://img.shields.io/github/license/SEU_USUARIO/mediflow?style=flat-square" />
  <img src="https://img.shields.io/github/stars/SEU_USUARIO/mediflow?style=flat-square" />
  <img src="https://img.shields.io/github/forks/SEU_USUARIO/mediflow?style=flat-square" />
  <img src="https://img.shields.io/github/issues/SEU_USUARIO/mediflow?style=flat-square" />
</div>

<p align="center">
  Sistema CRM completo para médicos e clínicas com IA, WhatsApp e automações
</p>

[Resto do README...]
```

## 🚀 Passo 8: Deploy Automático

### 8.1 Vercel (Recomendado)
1. Acesse [vercel.com](https://vercel.com)
2. Conecte com GitHub
3. Importe o repositório `mediflow`
4. Configure variáveis de ambiente
5. Deploy automático!

### 8.2 Netlify
1. Acesse [netlify.com](https://netlify.com)
2. "New site from Git"
3. Conecte repositório
4. Configure build: `npm run build`
5. Publish directory: `.next`

## 📈 Passo 9: Promover o Projeto

### 9.1 Adicionar ao Portfolio
- LinkedIn
- Site pessoal
- Currículo

### 9.2 Compartilhar
- Twitter/X
- Dev.to
- Reddit (r/webdev, r/nextjs)
- Discord communities

### 9.3 Documentar Jornada
- Blog posts sobre desenvolvimento
- Vídeos no YouTube
- Posts no LinkedIn

## 📊 Passo 10: Monitoramento

### 10.1 GitHub Insights
- **Traffic**: Visualizações e clones
- **Issues**: Bugs reportados
- **Pull Requests**: Contribuições

### 10.2 Analytics (se público)
- Google Analytics no site
- Vercel Analytics
- GitHub Stars tracking

## 🎯 Comandos Resumidos

```bash
# Setup inicial
git init
git add .
git commit -m "feat: setup inicial do projeto MediFlow"

# Conectar com GitHub
git remote add origin https://github.com/SEU_USUARIO/mediflow.git
git branch -M main
git push -u origin main

# Workflow diário
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin main
```

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código enviado (push)
- [ ] README.md atrativo
- [ ] .gitignore configurado
- [ ] LICENSE adicionada
- [ ] Issues templates criados
- [ ] CI/CD configurado
- [ ] Deploy automático
- [ ] Secrets configurados
- [ ] Branch protection ativada
- [ ] Projeto promovido

---

**🎉 Parabéns! Seu MediFlow está no GitHub e pronto para o mundo!**

### 🔗 Links Úteis
- [GitHub Docs](https://docs.github.com)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)