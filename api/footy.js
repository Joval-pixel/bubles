export default async function handler(req, res) {
  const date = req.query.date || new Date().toISOString().slice(0,10);
  const demo = { source: "demo", date, matches: [
    { home: "Flamengo", away: "Palmeiras", prob: 0.62 },
    { home: "Corinthians", away: "São Paulo", prob: 0.48 }
  ]};
  res.status(200).json(demo);
}