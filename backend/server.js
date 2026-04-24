import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const API_KEY = "a8a01eb35f33b891595b48713ea0e2bf";

app.get("/games", async (req, res) => {
  try {
    const response = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        },
      }
    );

    const data = await response.json();

    const games = data.response.map((g) => ({
      id: g.fixture.id,
      game: `${g.teams.home.name} vs ${g.teams.away.name}`,
      minute: g.fixture.status.elapsed || 0,
      odds: Math.random() * 3 + 1.2, // (pode melhorar depois)
      corners:
        g.statistics?.find((s) => s.type === "Corner Kicks")?.value || 0,
    }));

    res.json(games);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar jogos" });
  }
});

app.listen(3001, () => console.log("API rodando na porta 3001"));
