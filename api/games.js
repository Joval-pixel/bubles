export default function handler(req, res) {
  res.status(200).json([
    { id: 1, game: "Flamengo vs Palmeiras", odds: 2.2 },
    { id: 2, game: "Real Madrid vs Barcelona", odds: 1.9 }
  ]);
}
