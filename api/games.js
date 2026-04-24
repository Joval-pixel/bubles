export default function handler(req, res) {
  res.status(200).json([
    {
      id: 1,
      game: "Teste 1",
      minute: 70,
      corners: 8,
      shots: 12,
      dangerous: 20,
      odds: 2.1
    },
    {
      id: 2,
      game: "Teste 2",
      minute: 55,
      corners: 5,
      shots: 8,
      dangerous: 10,
      odds: 1.8
    }
  ]);
}
