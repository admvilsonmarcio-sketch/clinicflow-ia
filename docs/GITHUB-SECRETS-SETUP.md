# 🔐 Configuração de GitHub Secrets - MediFlow

## 🎯 **Problema Resolvido**
O pipeline de CI/CD estava falhando porque as variáveis de ambiente do Supabase não estavam configuradas no GitHub Actions.

---

## 🛠️ **Solução Implementada**

### **1. Modificações no Código**
- ✅ Adicionado lazy loading no `register-handler.ts`
- ✅ Implementado fallback no `supabase-server.ts`
- ✅ Configurado valores padrão no `next.config.js`

### **2. GitHub Secrets Necessários**
Para o pipeline funcionar completamente, você precisa configurar os seguintes secrets:

---

## 📋 **Secrets Obrigatórios**

### **NEXT_PUBLIC_SUPABASE_URL**
- **Valor:** URL do seu projeto Supabase
- **Formato:** `https://[seu-projeto].supabase.co`
- **Onde encontrar:** Dashboard do Supabase > Settings > API

### **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Valor:** Chave anônima do Supabase
- **Formato:** `eyJ...` (JWT token longo)
- **Onde encontrar:** Dashboard do Supabase > Settings > API > anon public

### **SUPABASE_SERVICE_ROLE_KEY** (Opcional)
- **Valor:** Chave de service role do Supabase
- **Formato:** `eyJ...` (JWT token longo)
- **Onde encontrar:** Dashboard do Supabase > Settings > API > service_role
- **⚠️ Cuidado:** Esta chave tem permissões administrativas

---

## 🔧 **Como Configurar os Secrets**

### **Passo 1: Acessar Configurações**
1. Vá para o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables**
4. Clique em **Actions**

### **Passo 2: Adicionar Secrets**
1. Clique em **New repository secret**
2. Adicione cada secret com o nome exato:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (se necessário)

### **Passo 3: Verificar Configuração**
1. Execute um novo commit para testar
2. Verifique se o pipeline passa na aba **Actions**

---

## 🏗️ **Workflow Atual**

O arquivo `.github/workflows/ci.yml` já está configurado para usar os secrets:

```yaml
- name: Build application
  run: npm run build
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

---

## 🔍 **Valores de Fallback**

Para evitar falhas durante o build, implementamos valores padrão:

```javascript
// next.config.js
env: {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
}
```

**⚠️ Importante:** Os valores de fallback são apenas para build. A aplicação não funcionará corretamente sem os valores reais.

---

## 🧪 **Testando a Configuração**

### **1. Build Local**
```bash
# Sem variáveis (deve funcionar com fallbacks)
npm run build

# Com variáveis reais
NEXT_PUBLIC_SUPABASE_URL=sua-url npm run build
```

### **2. Pipeline GitHub**
1. Faça um commit qualquer
2. Verifique a aba **Actions**
3. O job **Build** deve passar ✅

---

## 🚨 **Troubleshooting**

### **Erro: "Missing Supabase environment variables"**
- ✅ **Solução:** Configurar os GitHub Secrets
- ✅ **Status:** Resolvido com fallbacks

### **Erro: "Failed to collect page data"**
- ✅ **Solução:** Lazy loading implementado
- ✅ **Status:** Resolvido

### **Pipeline ainda falhando?**
1. Verifique se os secrets estão com nomes corretos
2. Confirme se os valores são válidos
3. Teste localmente primeiro

---

## 📝 **Próximos Passos**

1. [ ] **Configurar GitHub Secrets** (obrigatório)
2. [ ] **Testar pipeline** com commit
3. [ ] **Verificar build** na aba Actions
4. [ ] **Documentar URLs** do Supabase para a equipe

---

## 🔐 **Segurança**

### **Boas Práticas**
- ✅ Nunca commitar chaves no código
- ✅ Usar secrets do GitHub para CI/CD
- ✅ Separar chaves de desenvolvimento e produção
- ✅ Rotacionar chaves periodicamente

### **Chaves por Ambiente**
- **Desenvolvimento:** `.env.local` (não commitado)
- **CI/CD:** GitHub Secrets
- **Produção:** Variáveis de ambiente do deploy

---

**Última atualização:** $(date)  
**Responsável:** Marshall Paiva  
**Status:** 🔄 Aguardando configuração dos secrets