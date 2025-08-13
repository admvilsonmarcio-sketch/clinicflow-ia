# 📱 Sistema de Responsividade - MediFlow

## 🎯 Objetivo

Padronizar e validar a responsividade do projeto MediFlow (Next.js + Tailwind + shadcn/ui) com lint de Tailwind/CSS, testes visuais multi-breakpoint (Playwright) e auditoria Lighthouse.

## 🛠️ Ferramentas Configuradas

### 1. **ESLint + Tailwind CSS Plugin**
- Detecta classes Tailwind conflitantes
- Sugere ordem correta das classes
- Identifica uso de valores negativos arbitrários
- Migração automática do Tailwind 2 para 3

### 2. **Stylelint**
- Validação de CSS customizado
- Compatibilidade com sintaxe Tailwind
- Verificação de regras de responsividade

### 3. **Playwright - Testes Visuais**
- Screenshots automáticos em 6 breakpoints
- Detecção de overflow horizontal
- Verificação de elementos cortados
- Testes de usabilidade mobile

### 4. **Lighthouse - Auditoria de Performance**
- Performance, Acessibilidade, Best Practices
- Relatórios HTML detalhados
- Critérios de aceite automatizados

## 📏 Breakpoints Testados

| Dispositivo | Resolução | Uso |
|-------------|-----------|-----|
| Mobile | 375x667 | iPhone SE |
| Mobile Large | 414x896 | iPhone 11 Pro |
| Tablet | 768x1024 | iPad |
| Desktop | 1024x768 | Laptop pequeno |
| Desktop Large | 1440x900 | Monitor padrão |
| Desktop XL | 1920x1080 | Monitor grande |

## 🚀 Como Usar

### Comandos Disponíveis

```bash
# Lint completo (ESLint + Stylelint + Tailwind)
npm run lint

# Corrigir problemas automaticamente
npm run lint:fix

# Lint específico do Tailwind
npm run lint:tailwind

# Testes de responsividade
npm run test:responsive

# Testes com interface visual
npm run test:responsive:headed

# Auditoria Lighthouse
npm run lighthouse

# Auditoria completa (lint + testes + lighthouse)
npm run audit:full

# CI completo
npm run ci:responsive
```

### Executar Testes Localmente

1. **Iniciar o servidor de desenvolvimento:**
```bash
npm run dev
```

2. **Em outro terminal, executar os testes:**
```bash
# Testes de responsividade
npm run test:responsive

# Auditoria Lighthouse
npm run lighthouse
```

3. **Ver relatórios:**
- Screenshots: `reports/screenshots/`
- Playwright: `reports/playwright/`
- Lighthouse: `reports/lighthouse-summary.html`

## 🎯 Critérios de Aceite

### ✅ Lint
- `npm run lint` sem erros bloqueantes
- Zero classes Tailwind conflitantes
- CSS válido e bem formatado

### ✅ Testes de Responsividade
- `npm run test:responsive` sem elementos com overflow
- Screenshots gerados para todos os breakpoints
- Navegação mobile funcional
- Formulários utilizáveis em mobile
- Textos legíveis (≥ 12px)

### ✅ Lighthouse (Mobile)
- **Performance**: ≥ 80
- **Best Practices**: ≥ 90
- **Accessibility**: ≥ 90
- **SEO**: ≥ 80 (recomendado)

## 📊 Relatórios Gerados

### 1. **Screenshots por Breakpoint**
```
reports/screenshots/
├── home-mobile-375x667.png
├── home-tablet-768x1024.png
├── login-mobile-375x667.png
└── ...
```

### 2. **Relatórios de Overflow**
```
reports/screenshots/
├── home-mobile-overflow-report.txt
├── login-tablet-overflow-report.txt
└── ...
```

### 3. **Lighthouse HTML**
```
reports/
├── lighthouse-summary.html (consolidado)
├── lighthouse-home-mobile.html
├── lighthouse-login-desktop.html
└── ...
```

### 4. **Playwright HTML Report**
```
reports/playwright/
├── index.html
└── data/
```

## 🔧 Configurações

### ESLint (.eslintrc.json)
```json
{
  "plugins": ["@typescript-eslint/eslint-plugin", "tailwindcss"],
  "rules": {
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/no-contradicting-classname": "error"
  }
}
```

### Stylelint (.stylelintrc.json)
```json
{
  "extends": ["stylelint-config-standard"],
  "customSyntax": "postcss-html",
  "rules": {
    "at-rule-no-unknown": [true, {
      "ignoreAtRules": ["tailwind", "apply", "variants", "responsive", "screen"]
    }]
  }
}
```

### Playwright (playwright.config.ts)
- 5 projetos configurados (Mobile Chrome, Mobile Safari, Tablet, Desktop, Desktop Large)
- Screenshots automáticos em falhas
- Servidor de desenvolvimento automático
- Relatórios HTML e JSON

## 🚨 Troubleshooting

### Problema: Testes falhando por overflow
**Solução:**
1. Verificar relatórios em `reports/screenshots/*-overflow-report.txt`
2. Adicionar classes Tailwind apropriadas:
   - `overflow-hidden` para containers
   - `max-w-full` para elementos largos
   - `break-words` para textos longos

### Problema: Lighthouse com performance baixa
**Solução:**
1. Otimizar imagens (usar Next.js Image)
2. Implementar lazy loading
3. Reduzir JavaScript não utilizado
4. Usar `next/dynamic` para componentes pesados

### Problema: Elementos cortados em mobile
**Solução:**
1. Usar classes responsivas: `sm:`, `md:`, `lg:`
2. Testar com `npm run test:responsive:headed`
3. Ajustar padding/margin em breakpoints menores

## 📈 CI/CD

O workflow `.github/workflows/responsive-ci.yml` executa automaticamente:

- **Push**: Lint rápido + Type check
- **Pull Request**: Auditoria completa + comentário com resultados
- **Artifacts**: Relatórios salvos por 30 dias

## 🎨 Boas Práticas

### Mobile-First
```css
/* ✅ Correto */
.container {
  @apply w-full px-4;
  @apply sm:px-6 md:px-8 lg:max-w-4xl lg:mx-auto;
}

/* ❌ Evitar */
.container {
  @apply lg:max-w-4xl md:px-8 sm:px-6 w-full px-4;
}
```

### Breakpoints Consistentes
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile large
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Desktop large
      '2xl': '1536px', // Desktop XL
    }
  }
}
```

### Componentes Responsivos
```tsx
// ✅ Componente bem estruturado
const Card = ({ children }) => (
  <div className="
    w-full p-4 
    sm:p-6 
    md:max-w-md md:mx-auto 
    lg:max-w-lg
  ">
    {children}
  </div>
);
```

## 📚 Recursos Adicionais

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Playwright Testing](https://playwright.dev/docs/test-runners)
- [Lighthouse Performance](https://web.dev/performance-scoring/)
- [shadcn/ui Components](https://ui.shadcn.com/)