import { getJogos } from "../../lib/api";

export async function GET() {
  const jogos = await getJogos();
  return Response.json(jogos);
}
