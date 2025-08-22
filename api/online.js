// api/online.js
export const config = { runtime: "edge" };

const WINDOW_SECONDS = 60;              // janela que define "online agora"
const ZSET_KEY = "online:zset";         // chave no Redis

async function getRedis(env) {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN não definidos.");
  }
  return { url, token };
}

async function redisFetch({ url, token }, body) {
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Redis error: ${res.status} ${await res.text()}`);
  return res.json();
}

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: { "content-type": "application/json", ...(init.headers || {}) },
  });
}

export default async function handler(req) {
  try {
    const redis = await getRedis(process.env);
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - WINDOW_SECONDS;

    // Pré-flight CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Remover sessões antigas e contar atuais
    const pruneAndCount = [
      ["ZREMRANGEBYSCORE", ZSET_KEY, "0", `${cutoff}`],
      ["ZCARD", ZSET_KEY],
    ];

    if (req.method === "POST") {
      // Atualiza/insere presença da sessão
      const { sessionId } = await req.json().catch(() => ({}));
      if (!sessionId) return json({ error: "sessionId ausente" }, { status: 400 });

      const result = await redisFetch(redis, [
        ["ZADD", ZSET_KEY, "GT", now.toString(), sessionId],
        ...pruneAndCount,
      ]);
      const online = result?.[2]?.result ?? 0;

      return json(
        { online, windowSeconds: WINDOW_SECONDS },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // GET → só retorna o total atual
    const result = await redisFetch(redis, pruneAndCount);
    const online = result?.[1]?.result ?? 0;

    return json(
      { online, windowSeconds: WINDOW_SECONDS },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (e) {
    return json({ error: String(e?.message || e) }, { status: 500 });
  }
}
