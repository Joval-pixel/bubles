import { getJogos } from "../../../lib/api";

export async function GET() {
  try {
    const jogos = await getJogos();
    return Response.json(jogos);
  } catch (e) {
    return Response.json({ erro: "falha ao buscar jogos" });
  }
}
