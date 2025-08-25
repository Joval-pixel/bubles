// /api/picks.js — serve os palpites diários a partir de /data
import fs from "fs/promises";
import path from "path";

// Data de hoje em BRT (UTC-3)
function todayBRT() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const brt = new Date(utc - 3 * 3600000);
  return brt.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function readJSON(p) {
  const s = await fs.readFile(p, "utf-8");
  return JSON.parse(s);
}

export default async function handler(req, res) {
  try {
    const base = process.cwd();
    const dataDir = path.join(base, "data");

    // tenta arquivo do dia (picks-YYYY-MM-DD.json)
    const fileToday = path.join(dataDir, `picks-${todayBRT()}.json`);
    let payload = [];
    try {
      payload = await readJSON(fileToday);
    } catch {
      // se não houver, pega o mais recente
      const files = (await fs.readdir(dataDir))
        .filter(f => f.startsWith("picks-") && f.endsWith(".json"))
        .sort()
        .reverse();
      if (files.length) {
        payload = await readJSON(path.join(dataDir, files[0]));
      }
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.status(200).json(payload);
  } catch (e) {
    // fallback: não quebra o site
    res.status(200).json([]);
  }
}
