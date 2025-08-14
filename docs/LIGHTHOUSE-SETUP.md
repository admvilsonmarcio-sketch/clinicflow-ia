# Configuração do Lighthouse para Diferentes Ambientes

Este documento explica como usar o sistema de auditoria Lighthouse configurado para funcionar tanto em desenvolvimento local quanto em produção.

## Scripts Disponíveis

### Scripts Básicos

```bash
# Lighthouse com URL padrão (localhost:3000)
npm run lighthouse

# Lighthouse para desenvolvimento local (explícito)
npm run lighthouse:dev

# Lighthouse para produção (Vercel)
npm run lighthouse:prod
```

### Scripts de Auditoria Completa

```bash
# Auditoria completa para desenvolvimento
npm run audit:full

# Auditoria completa para produção
npm run audit:prod

# Scripts para CI/CD
npm run ci:responsive  # Para desenvolvimento
npm run ci:prod        # Para produção
```

## Configuração Personalizada

### Via Parâmetro de Linha de Comando

```bash
# Testar qualquer URL específica
node scripts/lighthouse-audit.mjs --url=https://meusite.com
```

### Via Variável de Ambiente

```bash
# Definir URL base via variável de ambiente
set LIGHTHOUSE_BASE_URL=https://meusite.com
npm run lighthouse
```

## URLs Testadas

O script testa automaticamente as seguintes páginas:

- **Home**: `{BASE_URL}/`
- **Login**: `{BASE_URL}/auth/login`
- **Registro**: `{BASE_URL}/auth/register`

## Critérios de Aceite

O script verifica os seguintes critérios para dispositivos móveis:

- **Performance**: ≥ 80
- **Best Practices**: ≥ 90
- **Accessibility**: ≥ 90
- **SEO**: Informativo (sem critério mínimo)

## Relatórios Gerados

Os relatórios são salvos em:

```
reports/
├── lighthouse-home-mobile.html
├── lighthouse-home-desktop.html
├── lighthouse-login-mobile.html
├── lighthouse-login-desktop.html
├── lighthouse-register-mobile.html
└── lighthouse-register-desktop.html
```

## Uso em CI/CD

### GitHub Actions

```yaml
# Para testar ambiente de produção
- name: Run Lighthouse Audit (Production)
  run: npm run lighthouse:prod

# Para testar ambiente de desenvolvimento
- name: Run Lighthouse Audit (Development)
  run: |
    npm run dev &
    sleep 10
    npm run lighthouse:dev
```

### Vercel

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## Troubleshooting

### Erro: "Cannot use import statement outside a module"

**Solução**: Certifique-se de que o arquivo tem extensão `.mjs` e que `package.json` contém `"type": "module"`.

### Erro: "Servidor deve estar rodando"

**Para desenvolvimento local**:
```bash
npm run dev
# Em outro terminal:
npm run lighthouse:dev
```

**Para produção**:
```bash
npm run lighthouse:prod
```

### Avisos sobre Chrome/taskkill

Os avisos sobre processos Chrome são normais e podem ser ignorados:

```
LH:ChromeLauncher:error taskkill stderr ERRO: o processo "XXXX" não foi encontrado.
⚠️  Aviso: Erro de permissão na limpeza de arquivos temporários (pode ser ignorado)
```

## Boas Práticas

1. **Desenvolvimento**: Use `npm run lighthouse:dev` após iniciar o servidor local
2. **CI/CD**: Use `npm run ci:prod` para testar a versão de produção
3. **Debugging**: Verifique os relatórios HTML gerados para detalhes específicos
4. **Performance**: Execute auditorias regularmente para monitorar regressões
5. **Segurança**: Nunca commite URLs com credenciais ou tokens

## Configuração de Ambiente

### Desenvolvimento

```bash
# .env.local
LIGHTHOUSE_BASE_URL=http://localhost:3000
```

### Produção

```bash
# .env.production
LIGHTHOUSE_BASE_URL=https://mediflow-tau.vercel.app
```

### Staging

```bash
# .env.staging
LIGHTHOUSE_BASE_URL=https://mediflow-staging.vercel.app
```

## Integração com Ferramentas de Monitoramento

O script pode ser integrado com:

- **GitHub Actions** para CI/CD
- **Vercel** para deploy automático
- **Slack/Discord** para notificações
- **Grafana/DataDog** para métricas

## Contribuição

Ao modificar o script Lighthouse:

1. Teste em desenvolvimento e produção
2. Atualize a documentação
3. Verifique se os critérios de aceite ainda são válidos
4. Execute `npm run audit:full` antes do commit