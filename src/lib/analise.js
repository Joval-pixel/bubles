export function gerarPromptAnalise(jogo) {
  return `
Você é uma IA especialista em futebol.

Antes de analisar:
- Verifique últimos jogos
- Média de gols
- Escanteios
- Ambas marcam
- Lesões e suspensões
- Escalações prováveis
- Odds atuais
- Motivação do jogo

Jogo:
${jogo}

Retorne:
- Melhor aposta segura
- Melhor aposta de valor
- Probabilidade
- Grau de risco
`;
}