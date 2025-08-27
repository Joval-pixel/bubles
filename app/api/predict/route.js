import data from "../../../data/matches.json" assert { type: "json" };
import { expectedGoals, probs1x2, probsOverUnder, probsBTTS, scoreMatrix } from "../../../lib/poisson";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const match = data.matches.find(m => m.id === id) || data.matches[0];

  const { expHome, expAway } = expectedGoals(data.teams, match);
  const oneXtwo = probs1x2(expHome, expAway);
  const ou = probsOverUnder(expHome, expAway, 2.5);
  const btts = probsBTTS(expHome, expAway);
  const matrix = scoreMatrix(expHome, expAway, 3);

  const tips = [];
  const max = Math.max(oneXtwo.homeWin, oneXtwo.draw, oneXtwo.awayWin);
  if (max === oneXtwo.homeWin) tips.push("1 (Casa)");
  else if (max === oneXtwo.awayWin) tips.push("2 (Fora)");
  else tips.push("X (Empate)");

  if (ou.over > 0.58) tips.push("Mais de 2.5 gols");
  if (ou.under > 0.58) tips.push("Menos de 2.5 gols");
  if (btts.btts > 0.55) tips.push("Ambos marcam");

  return Response.json({
    match,
    probs: { ...oneXtwo, over25: ou.over, under25: ou.under, btts: btts.btts },
    tips,
    matrix
  });
}
