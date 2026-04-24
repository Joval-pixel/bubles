export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY;
  // Buscando 'upcoming' para garantir que sempre haja dados, mesmo que o mercado live esteja parado
  const url = `https://the-odds-api.com{API_KEY}&regions=eu&markets=h2h&bookmakers=pinnacle`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "error") throw new Error(data.msg);
    res.status(200).json(Array.isArray(data) ? data : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
