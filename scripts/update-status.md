# 📝 Como Atualizar o Status do Projeto

## Quando atualizar o STATUS-PROJETO.md:

### ✅ Sempre que:
- Completar uma funcionalidade
- Resolver um bug importante
- Adicionar nova página/componente
- Fazer mudanças na arquitetura
- Corrigir problemas de configuração

### 📋 O que atualizar:

1. **Data da última atualização**
2. **Seção "O que já está PRONTO"** - mover itens de "Em desenvolvimento"
3. **Seção "Em DESENVOLVIMENTO"** - adicionar novos itens
4. **Seção "Problemas RESOLVIDOS"** - documentar correções
5. **Seção "Problemas CONHECIDOS"** - adicionar novos issues
6. **Métricas do projeto** - atualizar números
7. **Próxima atualização prevista** - definir nova data

### 🎯 Template para novos itens:

```markdown
- [x] **Nome da funcionalidade** - descrição breve
- [ ] **Funcionalidade pendente** - o que falta fazer
```

### 📊 Como contar métricas:

```bash
# Contar arquivos
find . -name "*.tsx" -o -name "*.ts" -o -name "*.js" | wc -l

# Contar linhas de código
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l

# Contar componentes
find ./components -name "*.tsx" | wc -l
```

### 🔄 Frequência de atualização:
- **Diariamente** durante desenvolvimento ativo
- **Semanalmente** durante manutenção
- **Sempre** antes de commits importantes