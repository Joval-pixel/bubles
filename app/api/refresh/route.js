import { getJogos } from "@/app/lib/api";

export async function GET() {
  const jogos = await getJogos();
  return Response.json(jogos);
}
