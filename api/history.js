export default async function handler(req, res) {
  const { home, away } = req.query;
  const demo = { source: "demo", home, away, last10: [
    { match: "Flamengo 2x1 Palmeiras" },
    { match: "Palmeiras 0x0 Flamengo" }
  ]};
  res.status(200).json(demo);
}