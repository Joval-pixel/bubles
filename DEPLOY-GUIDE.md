# 🚀 Guia de Deploy - Bubles no Vercel

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)
- Arquivos do projeto Bubles

## 🔄 Passo a Passo

### 1. 📁 Preparar Arquivos
```bash
# Estrutura necessária:
bubles-palpites/
├── index.html
├── style.css
├── script.js
├── package.json
├── vercel.json
├── .gitignore
└── README.md
```

### 2. 📤 Upload para GitHub

#### Opção A: Via Interface Web
1. Acesse [github.com](https://github.com)
2. Clique em **"New repository"**
3. Nome: `bubles-palpites`
4. Descrição: `Visualização de palpites esportivos em bolhas`
5. Marque **"Public"**
6. Clique **"Create repository"**
7. Faça upload de todos os arquivos

#### Opção B: Via Git (Terminal)
```bash
# Inicializar repositório
git init
git add .
git commit -m "Initial commit - Bubles v2.0"

# Conectar ao GitHub
git remote add origin https://github.com/SEU-USUARIO/bubles-palpites.git
git branch -M main
git push -u origin main
```

### 3. 🌐 Deploy no Vercel

#### Método 1: Importar do GitHub
1. Acesse [vercel.com](https://vercel.com)
2. Clique **"New Project"**
3. Selecione **"Import Git Repository"**
4. Escolha o repositório `bubles-palpites`
5. Configurações:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (deixar vazio)
   - **Output Directory**: (deixar vazio)
6. Clique **"Deploy"**

#### Método 2: Via CLI do Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### 4. 🔗 Configurar Domínio Personalizado

#### Para bubles.com.br:
1. No dashboard do Vercel
2. Vá em **"Settings" > "Domains"**
3. Adicione `bubles.com.br`
4. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
5. Aguarde propagação (até 24h)

### 5. ✅ Verificar Deploy

#### Checklist:
- [ ] Site carrega corretamente
- [ ] Bolhas aparecem e animam
- [ ] Controles funcionam
- [ ] Modal abre ao clicar
- [ ] Responsivo no mobile
- [ ] Performance 60 FPS

#### URLs de Teste:
- **Vercel**: `https://bubles-palpites.vercel.app`
- **Personalizado**: `https://bubles.com.br`

## 🔧 Configurações Avançadas

### Variables de Ambiente (Opcional)
```bash
# No dashboard do Vercel > Settings > Environment Variables
RAPIDAPI_KEY=sua_chave_aqui  # Para dados reais da API-Football
```

### Headers de Segurança
Já configurados no `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Performance
- **Compressão Gzip**: Automática no Vercel
- **CDN Global**: Incluído
- **Cache**: Configurado para assets estáticos

## 🚨 Solução de Problemas

### Erro 404
- Verificar se `vercel.json` está correto
- Confirmar estrutura de arquivos
- Redeployar: `vercel --prod --force`

### Bolhas não aparecem
- Verificar console do navegador (F12)
- Confirmar se `script.js` carregou
- Testar localmente primeiro

### Performance baixa
- Reduzir número de bolhas no `CONFIG.BUBBLE_COUNT`
- Verificar se está rodando a 60 FPS
- Testar em dispositivos diferentes

## 📊 Monitoramento

### Analytics (Opcional)
Adicionar no `<head>` do `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Logs do Vercel
- Dashboard > Functions > View Function Logs
- Monitorar erros e performance

## 🔄 Atualizações

### Deploy Automático
- Push para `main` = Deploy automático
- Pull Requests = Preview deploys

### Deploy Manual
```bash
# Atualizar código
git add .
git commit -m "Atualização: nova funcionalidade"
git push

# Ou forçar redeploy
vercel --prod --force
```

## ✅ Checklist Final

- [ ] ✅ Repositório GitHub criado
- [ ] ✅ Arquivos enviados
- [ ] ✅ Projeto conectado ao Vercel
- [ ] ✅ Deploy realizado com sucesso
- [ ] ✅ Domínio configurado
- [ ] ✅ Site funcionando perfeitamente
- [ ] ✅ Performance otimizada
- [ ] ✅ Responsivo testado

**🎉 Parabéns! Seu site Bubles está no ar!**

---

**Suporte**: Em caso de problemas, verifique os logs do Vercel ou teste localmente primeiro.

