# Troubleshooting MediFlow

## Problema: Páginas sem estilização (Tailwind não funciona)

### Soluções:

1. **Limpar cache do Next.js:**
   ```bash
   rm -rf .next
   # ou no Windows:
   Remove-Item -Recurse -Force .next
   ```

2. **Verificar se as dependências estão instaladas:**
   ```bash
   npm install
   ```

3. **Verificar se o PostCSS está configurado:**
   - Arquivo `postcss.config.js` deve existir na raiz

4. **Verificar se o Tailwind está configurado:**
   - Arquivo `tailwind.config.js` deve ter os paths corretos

5. **Reiniciar o servidor:**
   ```bash
   npm run dev
   ```

## Problema: Erro "Forbidden use of secret API key"

### Solução:
- No arquivo `.env.local`, use a chave **anon** (não service_role)
- A chave anon começa com `eyJ...`
- Nunca use chaves que começam com `sb_secret_` no frontend

## Problema: Erro de importação de módulos

### Solução:
- Verificar se o `tsconfig.json` tem o baseUrl e paths configurados
- Verificar se todos os arquivos existem nos caminhos corretos

## Como testar se o Tailwind funciona:

1. Abra o arquivo `test-tailwind.html` no navegador
2. Se estiver estilizado, o Tailwind funciona
3. Se não estiver, há problema na configuração

## Comandos úteis:

```bash
# Instalar dependências
npm install

# Limpar cache
rm -rf .next

# Reinstalar node_modules
rm -rf node_modules
npm install

# Verificar se o Tailwind está funcionando
npx tailwindcss -i ./app/globals.css -o ./test-output.css --watch
```