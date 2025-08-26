# 🫧 BUBLES - Palpites em Bolhas

Sistema avançado de visualização de palpites esportivos em bolhas animadas com probabilidades de acerto.

## 🎯 Funcionalidades

- **30 dias grátis** para novos usuários
- **Bolhas inteligentes**: Tamanho baseado na probabilidade de acerto
- **Todos os jogos do dia** em tempo real
- **Filtros avançados** por mercado e liga
- **Sistema de autenticação** completo
- **Dashboard protegido** com paywall
- **Engine de física** realística para bolhas
- **Dados em tempo real** via API-Football

## 🚀 Como usar

### Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/bubles-palpites.git
cd bubles-palpites

# Inicie o servidor local
python3 -m http.server 3000

# Acesse http://localhost:3000
```

### Deploy no Vercel

1. **Conecte ao GitHub**: Importe o repositório no Vercel
2. **Configure variáveis** (opcional):
   - `RAPIDAPI_KEY`: Chave da API-Football para dados reais
3. **Deploy automático**: O Vercel fará o deploy automaticamente

## 📊 Sistema de Bolhas

### Tamanhos das Bolhas
- **Bolhas Grandes**: Alta probabilidade de acerto (70%+)
- **Bolhas Médias**: Probabilidade moderada (50-70%)
- **Bolhas Pequenas**: Baixa probabilidade (30-50%)

### Cores das Bolhas
- **Verde**: Viés positivo (Over/Favorito)
- **Vermelho**: Viés negativo (Under/Azarão)
- **Cinza**: Neutro/Equilibrado

### Mercados Suportados
- **Over/Under 2.5**: Apostas em total de gols
- **1X2**: Resultado final do jogo

## 🔧 Estrutura do Projeto

```
bubles-palpites/
├── index.html          # Página principal
├── style.css           # Estilos modernos
├── script.js           # Lógica da aplicação
├── api/
│   └── footy.js        # Função serverless (proxy API)
├── package.json        # Configurações do projeto
├── vercel.json         # Configuração do Vercel
└── README.md           # Documentação
```

## 🎮 Como Funciona

### 1. Cadastro e Trial
- Usuário se cadastra gratuitamente
- Ganha **30 dias de acesso completo**
- Após expirar, pode assinar por R$ 39,90/mês

### 2. Algoritmo de Probabilidades
```javascript
// Cálculo da probabilidade de acerto
const probability = calculateWinProbability(odds, market, history);

// Tamanho da bolha baseado na probabilidade
const bubbleSize = 20 + (probability * 60); // 20px a 80px

// Confiança baseada no volume de apostas
const confidence = Math.min(bookmakerCount / 10, 1);
```

### 3. Atualização em Tempo Real
- Dados atualizados **a cada minuto**
- Cache inteligente para performance
- Fallback para dados demo se API offline

## 🔑 Variáveis de Ambiente

```bash
# Opcional - Para dados reais da API-Football
RAPIDAPI_KEY=sua_chave_aqui
```

## 📱 Responsividade

- **Desktop**: Layout em grid com sidebar
- **Tablet**: Layout adaptativo
- **Mobile**: Interface otimizada para toque

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Vercel Serverless Functions
- **API**: API-Football (RapidAPI)
- **Deploy**: Vercel
- **Versionamento**: Git/GitHub

## 📈 Roadmap

- [ ] Integração com mais APIs de odds
- [ ] Sistema de notificações push
- [ ] Análise histórica de performance
- [ ] App mobile nativo
- [ ] Sistema de afiliados
- [ ] Múltiplas moedas e idiomas

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: suporte@bubles.com.br
- **Discord**: [Comunidade Bubles](https://discord.gg/bubles)
- **Documentação**: [docs.bubles.com.br](https://docs.bubles.com.br)

---

**BUBLES** - Transformando dados em insights visuais para apostas esportivas inteligentes.

*Jogue com responsabilidade. +18 anos.*

