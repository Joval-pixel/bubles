export function gerarPromptAnalise(jogo) {
  return `
Você é uma IA especialista em futebol.

Analise:
- últimos jogos
- gols
- escanteios
- ambas marcam
- desfalques
- odds
- momento atual

Jogo:
${jogo}
`;
}