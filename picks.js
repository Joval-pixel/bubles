// /api/picks.js — Retorna os palpites diários (mock).
// Em produção, gere este JSON diariamente a partir do seu pipeline de análise (prompt).
import fs from 'fs/promises';
export default async function handler(req, res){
  try{
    const data = await fs.readFile(process.cwd()+"/data/picks-sample.json", "utf-8");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.status(200).json(JSON.parse(data));
  } catch(e){
    res.status(200).json([]);
  }
}
