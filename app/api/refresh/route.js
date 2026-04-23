import { getJogos } from "@/lib/api";

export async function GET() {
  try {
    const jogos = await getJogos();

    return Response.json(jogos || []);
  } catch (err) {
    console.error("ERRO API:", err);

    return Response.json([]);
  }
}
