# 🚀 Instruções de Deploy - BUBLES

## 📋 Checklist Pré-Deploy

- [ ] Todos os arquivos estão na pasta do projeto
- [ ] Repositório GitHub criado
- [ ] Conta Vercel configurada
- [ ] Chave da API-Football (opcional)

## 🔧 Estrutura dos Arquivos

```
bubles-palpites/
├── index.html              # ✅ Página principal
├── style.css               # ✅ Estilos modernos
├── script.js               # ✅ Lógica principal
├── script-enhanced.js      # ✅ Versão avançada (opcional)
├── api/
│   └── footy.js            # ✅ Função serverless
├── package.json            # ✅ Configurações
├── vercel.json             # ✅ Config Vercel
├── .gitignore              # ✅ Arquivos ignorados
├── README.md               # ✅ Documentação
└── INSTRUCOES-DEPLOY.md    # ✅ Este arquivo
```

## 🎯 Passo a Passo

### 1. Preparar Repositório GitHub

```bash
# 1. Criar repositório no GitHub
# 2. Clonar localmente
git clone https://github.com/SEU-USUARIO/bubles-palpites.git
cd bubles-palpites

# 3. Copiar todos os arquivos para a pasta
# 4. Fazer commit inicial
git add .
git commit -m "🎉 Initial commit - Bubles Palpites v2.0"
git push origin main
```

### 2. Deploy no Vercel

#### Opção A: Via Dashboard
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Configure as variáveis (opcional):
   - `RAPIDAPI_KEY`: Sua chave da API-Football
5. Clique em "Deploy"

#### Opção B: Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### 3. Configurar Variáveis de Ambiente (Opcional)

No dashboard do Vercel:
1. Vá em "Settings" > "Environment Variables"
2. Adicione:
   - **Nome**: `RAPIDAPI_KEY`
   - **Valor**: Sua chave da RapidAPI
   - **Environment**: Production

### 4. Testar o Site

Após o deploy:
- [ ] Página inicial carrega
- [ ] Cadastro funciona
- [ ] Login funciona
- [ ] Bolhas aparecem e se movem
- [ ] Filtros funcionam
- [ ] Dashboard protegido funciona
- [ ] Sistema de 30 dias grátis funciona

## 🎮 Funcionalidades Implementadas

### ✅ Sistema de Bolhas Inteligente
- **Bolhas grandes**: Alta probabilidade de acerto (70%+)
- **Bolhas médias**: Probabilidade moderada (50-70%)
- **Bolhas pequenas**: Baixa probabilidade (30-50%)

### ✅ Algoritmo de Probabilidades
- Análise de odds (40% peso)
- Volume do mercado (30% peso)
- Performance histórica (20% peso)
- Consenso das casas (10% peso)

### ✅ Todos os Jogos do Dia
- Brasileirão, Premier League, La Liga
- Serie A, Bundesliga, Ligue 1
- Ordenados por probabilidade
- Atualizados em tempo real

### ✅ Sistema de Autenticação
- 30 dias grátis após cadastro
- Dashboard protegido
- Paywall após expiração
- Simulação de pagamento PIX

## 🔄 Versões do Script

### script.js (Padrão)
- Funcionalidades básicas
- Compatível com todos os navegadores
- Recomendado para produção

### script-enhanced.js (Avançado)
- Algoritmo de probabilidades
- Bolhas inteligentes
- Mais jogos simultâneos
- Animações avançadas

**Para usar a versão avançada:**
```html
<!-- Substituir no index.html -->
<script src="script-enhanced.js"></script>
```

## 🐛 Troubleshooting

### Problema: Bolhas não aparecem
**Solução**: Verificar console do navegador, pode ser erro de JavaScript

### Problema: API não funciona
**Solução**: Dados demo são carregados automaticamente

### Problema: Login não funciona
**Solução**: Verificar localStorage do navegador

### Problema: Deploy falha
**Solução**: Verificar se todos os arquivos estão no repositório

## 📊 Monitoramento

### Métricas Importantes
- Taxa de cadastro
- Retenção de usuários
- Conversão trial → pago
- Performance das bolhas

### Analytics Recomendados
- Google Analytics
- Hotjar (heatmaps)
- Vercel Analytics
- Custom events

## 🔧 Customizações

### Alterar Cores
Editar variáveis CSS em `style.css`:
```css
:root {
    --accent-primary: #00d4aa;  /* Cor principal */
    --accent-secondary: #0ea5e9; /* Cor secundária */
}
```

### Alterar Configurações
Editar `CONFIG` em `script.js`:
```javascript
const CONFIG = {
    TRIAL_DAYS: 30,           // Dias grátis
    SUBSCRIPTION_PRICE: 39.90, // Preço mensal
    MAX_BUBBLES: 50           // Máximo de bolhas
};
```

### Adicionar Novas Ligas
Editar `generateAllTodaysMatches()` em `script-enhanced.js`

## 📞 Suporte

- **Email**: suporte@bubles.com.br
- **GitHub Issues**: Para bugs e melhorias
- **Discord**: Comunidade de desenvolvedores

---

**🎉 Parabéns! Seu site Bubles está pronto para o mundo!**

*Lembre-se: Jogue com responsabilidade. +18 anos.*

