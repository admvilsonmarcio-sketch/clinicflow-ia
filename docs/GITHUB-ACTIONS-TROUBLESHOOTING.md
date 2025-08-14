# 🔧 Troubleshooting GitHub Actions

Guia para resolver problemas comuns nos workflows do GitHub Actions do MediFlow.

## 🚨 Problemas Comuns

### 1. Erro: "Servidor deve estar rodando em http://localhost:3000"

**Problema**: O script Lighthouse tenta acessar localhost no ambiente CI.

**Causa**: No GitHub Actions não há servidor de desenvolvimento rodando.

**Solução**: ✅ **RESOLVIDO**
- Script agora detecta automaticamente ambiente GitHub Actions
- Usa URL de produção (`https://mediflow-tau.vercel.app`) no CI
- Mantém localhost para desenvolvimento local

```javascript
// Detecção automática no script
if (process.env.GITHUB_ACTIONS) {
  return 'https://mediflow-tau.vercel.app';
}
```

### 1.1. Erros de Auditorias Não Implementadas no Lantern

**Problema**: 
- `FCP All Frames not implemented in lantern`
- `LCP All Frames not implemented in lantern`

**Solução**: ✅ **RESOLVIDO**
- Removidas auditorias específicas que causam problemas: `first-contentful-paint-all-frames` e `largest-contentful-paint-all-frames`
- Configuração atualizada para usar `onlyCategories` em vez de `onlyAudits`
- Adicionado `skipAudits` para evitar auditorias problemáticas

### 1.2. Erro de Emulação Mobile/Desktop

**Problema**: `Screen emulation mobile setting (true) does not match formFactor setting (desktop)`

**Solução**: ✅ **RESOLVIDO**
- Adicionada configuração explícita de `screenEmulation` para cada formFactor
- Configuração correta de dimensões e deviceScaleFactor
- Mobile: 375x667, deviceScaleFactor: 2
- Desktop: 1350x940, deviceScaleFactor: 1

### 1.3. Melhor Tratamento de Erros

**Problema**: Script parando na primeira falha de limpeza do Chrome

**Solução**: ✅ **RESOLVIDO**
- Tratamento específico para erros de permissão (`EPERM`)
- Continuação da execução mesmo com erros de limpeza
- Logs mais detalhados para debugging

### 2. Falha no Build por Variáveis de Ambiente

**Problema**: Build falha por falta de secrets do Supabase.

**Solução**:
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Adicione os secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Testes de Responsividade Falhando

**Problema**: Playwright não consegue instalar dependências.

**Solução**:
```yaml
- name: Setup Playwright
  run: npx playwright install --with-deps
```

### 4. Timeout nos Workflows

**Problema**: Jobs demoram muito para executar.

**Soluções**:
- Usar cache do npm: `cache: 'npm'`
- Executar jobs em paralelo quando possível
- Otimizar número de workers do Playwright

### 5. Artifacts não são Salvos

**Problema**: Relatórios não aparecem nos artifacts.

**Solução**:
```yaml
- name: Upload dos relatórios
  uses: actions/upload-artifact@v4
  if: always()  # Importante: sempre executar
  with:
    name: reports
    path: |
      reports/
      test-results/
    retention-days: 30
```

## 🔍 Como Debuggar

### 1. Ativar Debug Logs

Adicione secrets no repositório:
- `ACTIONS_STEP_DEBUG`: `true`
- `RUNNER_DEBUG`: `true`

### 2. Verificar Logs Detalhados

1. Vá na aba **Actions**
2. Clique no workflow que falhou
3. Expanda os steps para ver logs detalhados
4. Procure por mensagens de erro em vermelho

### 3. Testar Localmente

Simule o ambiente CI:
```bash
# Simular GitHub Actions
$env:GITHUB_ACTIONS='true'
npm run lighthouse

# Testar com URL específica
npm run lighthouse:prod
```

## 📊 Workflows Atuais

### CI Principal (`ci.yml`)
- **Trigger**: Push/PR para `main` e `develop`
- **Jobs**: Test, Build, Security, Lighthouse
- **Duração**: ~3-5 minutos

### Responsividade (`responsive-ci.yml`)
- **Trigger**: Push/PR para `main` e `develop`
- **Jobs**: Testes responsivos + Lighthouse
- **Duração**: ~5-8 minutos
- **Artifacts**: Relatórios por 30 dias

## 🛠️ Comandos Úteis

### Verificar Status dos Workflows
```bash
# Via GitHub CLI
gh run list
gh run view [RUN_ID]
```

### Re-executar Workflow Falhado
```bash
gh run rerun [RUN_ID]
```

### Baixar Artifacts
```bash
gh run download [RUN_ID]
```

## 🔧 Configurações Recomendadas

### Branch Protection Rules
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators

### Secrets Necessários
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
ACTIONS_STEP_DEBUG=true (opcional)
RUNNER_DEBUG=true (opcional)
```

## 📈 Monitoramento

### Métricas Importantes
- **Success Rate**: >95%
- **Duration**: <10 minutos
- **Lighthouse Scores**: Performance >80, outros >90
- **Test Coverage**: Todas as páginas principais

### Alertas
- Falhas consecutivas (>3)
- Duração excessiva (>15 min)
- Scores Lighthouse abaixo do limite

## 🚀 Otimizações Implementadas

### Cache Inteligente
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'  # Cache automático
```

### Jobs Paralelos
- Test e Security rodam independentemente
- Lighthouse só roda após build bem-sucedido

### Detecção Automática de Ambiente
- Script Lighthouse detecta CI automaticamente
- URLs configuradas por ambiente

## 📋 Checklist de Troubleshooting

Quando um workflow falha:

- [ ] Verificar logs detalhados do step que falhou
- [ ] Confirmar se secrets estão configurados
- [ ] Testar comandos localmente
- [ ] Verificar se dependências estão atualizadas
- [ ] Confirmar se URLs de produção estão acessíveis
- [ ] Verificar se há mudanças breaking no código
- [ ] Re-executar workflow para confirmar falha
- [ ] Criar issue se problema persistir

## 🆘 Quando Pedir Ajuda

Crie uma issue com:
- Link do workflow que falhou
- Logs completos do erro
- Passos para reproduzir
- Ambiente (branch, commit)
- Screenshots se relevante

---

**💡 Dica**: A maioria dos problemas são resolvidos verificando secrets e testando comandos localmente primeiro.

**🔗 Links Úteis**:
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright CI](https://playwright.dev/docs/ci)