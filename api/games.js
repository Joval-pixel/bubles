export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY;

  try {
    // Usando um endpoint mais genérico para garantir que venha QUALQUER jogo de futebol
    const response = await fetch(`https://the-odds-api.com{API_KEY}&regions=eu&markets=h2h`);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Erro na API Key ou Limite atingido", details: data });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Falha de conexão com a API", message: error.message });
  }
}
