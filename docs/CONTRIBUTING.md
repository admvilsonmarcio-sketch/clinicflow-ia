# 🤝 Contribuindo para o MediFlow

Obrigado por considerar contribuir para o MediFlow! Este documento fornece diretrizes para contribuições.

## 📋 Como Contribuir

### 🐛 Reportando Bugs
1. Verifique se o bug já foi reportado nas [Issues](../../issues)
2. Crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots se aplicável
   - Informações do ambiente (OS, browser, etc.)

### 💡 Sugerindo Melhorias
1. Verifique se a sugestão já existe nas [Issues](../../issues)
2. Crie uma nova issue com:
   - Descrição clara da melhoria
   - Justificativa (por que seria útil)
   - Possível implementação (se souber)

### 🔧 Contribuindo com Código

#### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Git configurado

#### Setup do Ambiente
```bash
# 1. Fork e clone o repositório
git clone https://github.com/SEU_USUARIO/mediflow.git
cd mediflow

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais

# 4. Executar o schema no Supabase
# Cole o conteúdo de database-schema.sql no SQL Editor

# 5. Iniciar desenvolvimento
npm run dev
```

#### Fluxo de Desenvolvimento
1. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. **Faça suas alterações** seguindo os padrões:
   - Use TypeScript
   - Siga as convenções de nomenclatura
   - Adicione comentários quando necessário
   - Teste suas alterações

3. **Commit suas mudanças**:
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

4. **Push para sua branch**:
   ```bash
   git push origin feature/nome-da-feature
   ```

5. **Abra um Pull Request** com:
   - Título claro
   - Descrição detalhada das mudanças
   - Screenshots se aplicável
   - Referência a issues relacionadas

## 📝 Padrões de Código

### Estrutura de Arquivos
```
mediflow/
├── app/                    # Pages do Next.js 14
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── dashboard/        # Componentes específicos
├── lib/                  # Utilitários e configurações
├── types/                # Definições TypeScript
├── docs/                 # Documentação
└── scripts/              # Scripts auxiliares
```

### Convenções de Nomenclatura
- **Arquivos**: kebab-case (`patient-form.tsx`)
- **Componentes**: PascalCase (`PatientForm`)
- **Variáveis**: camelCase (`patientData`)
- **Constantes**: UPPER_CASE (`API_URL`)
- **Banco de dados**: snake_case (`nome_completo`)

### Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` tarefas de manutenção

### TypeScript
- Use tipos explícitos sempre que possível
- Evite `any`, prefira `unknown`
- Use interfaces para objetos complexos
- Documente tipos complexos
- Implemente validações robustas com Zod
- Use tipos condicionais para campos opcionais

### React/Next.js
- Use Server Components quando possível
- Client Components apenas quando necessário
- Prefira hooks nativos
- Use Suspense para loading states
- Implemente formatação automática de máscaras
- Garanta exclusão completa de dados relacionados

## 🧪 Testes

### Executando Testes
```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

### Escrevendo Testes
- Teste funcionalidades críticas
- Use nomes descritivos
- Teste casos de erro
- Mock dependências externas

## 📚 Documentação

### Atualizando Documentação
- Mantenha o `STATUS-PROJETO.md` atualizado
- Documente novas APIs
- Atualize o README se necessário
- Adicione comentários no código

### Estrutura da Documentação
- `README.md` - Visão geral do projeto
- `STATUS-PROJETO.md` - Status atual e roadmap
- `TROUBLESHOOTING.md` - Solução de problemas
- `docs/` - Documentação técnica detalhada

## 🔒 Segurança

### Boas Práticas
- Nunca commite credenciais
- Use variáveis de ambiente
- Valide inputs do usuário
- Implemente rate limiting
- Siga princípios LGPD/GDPR
- Implemente exclusão completa (direito ao esquecimento)
- Valide campos opcionais corretamente
- Sanitize dados antes de salvar no banco

### Reportando Vulnerabilidades
Para vulnerabilidades de segurança, envie email para:
**security@mediflow.com** (não use issues públicas)

## 📞 Suporte

### Canais de Comunicação
- **Issues**: Para bugs e features
- **Discussions**: Para dúvidas gerais
- **Discord**: [Link do servidor] (em breve)

### Respondemos em
- Issues: 24-48 horas
- Pull Requests: 48-72 horas
- Emails de segurança: 24 horas

## 🎯 Roadmap de Contribuições

### Prioridade Alta
- [x] CRUD completo de pacientes (v2.5)
- [x] Validações robustas de campos (v2.5)
- [x] Formatação automática de máscaras (v2.5)
- [x] Exclusão completa com documentos (v2.5)
- [ ] Sistema de agendamentos
- [ ] Integração WhatsApp

### Prioridade Média
- [ ] Relatórios e analytics
- [ ] Temas personalizáveis
- [ ] Notificações push

### Prioridade Baixa
- [ ] Aplicativo mobile
- [ ] Integrações avançadas
- [ ] Multi-idioma

## 🏆 Reconhecimento

Contribuidores são reconhecidos:
- No README.md
- Nas release notes
- No hall da fama (em breve)

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

---

**Obrigado por contribuir para o MediFlow! 🚀**