import data from "../../../data/matches.json" assert { type: "json" };

export async function GET() {
  const now = new Date();
  const today = data.matches.filter(m => {
    const d = new Date(m.kickoff);
    return d.getUTCFullYear() === now.getUTCFullYear() &&
           d.getUTCMonth() === now.getUTCMonth() &&
           d.getUTCDate() === now.getUTCDate();
  });
  return Response.json({ matches: today.length ? today : data.matches });
}
