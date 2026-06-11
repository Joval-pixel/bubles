const ALLOWED_LOGO_HOSTS = new Set(["media.api-sports.io"]);
const CACHE_CONTROL = "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800";

const buildHeaders = (extra = {}) => ({
  "Cache-Control": CACHE_CONTROL,
  ...extra,
});

const getLogoSource = (request) => {
  try {
    const url = new URL(request?.url || "https://bubles.local/api/team-logo");
    return url.searchParams.get("src") || "";
  } catch (_error) {
    return "";
  }
};

const isAllowedLogoUrl = (value) => {
  if (!value) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);

    return (
      parsedUrl.protocol === "https:" &&
      ALLOWED_LOGO_HOSTS.has(parsedUrl.hostname) &&
      /^\/football\/teams\/\d+\.(png|svg)$/i.test(parsedUrl.pathname)
    );
  } catch (_error) {
    return false;
  }
};

export async function GET(request) {
  const source = getLogoSource(request);

  if (!isAllowedLogoUrl(source)) {
    return new Response("Invalid logo source", {
      status: 400,
      headers: buildHeaders({ "Content-Type": "text/plain; charset=utf-8" }),
    });
  }

  try {
    const upstreamResponse = await fetch(source, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 Bubles Team Logo Proxy",
      },
    });

    if (!upstreamResponse.ok) {
      return new Response("Logo unavailable", {
        status: upstreamResponse.status,
        headers: buildHeaders({ "Content-Type": "text/plain; charset=utf-8" }),
      });
    }

    const contentType = upstreamResponse.headers.get("content-type") || "image/png";
    const body = await upstreamResponse.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: buildHeaders({
        "Content-Length": String(body.byteLength),
        "Content-Type": contentType,
      }),
    });
  } catch (error) {
    return new Response(`Logo fetch failed: ${error?.message || "unknown error"}`, {
      status: 502,
      headers: buildHeaders({ "Content-Type": "text/plain; charset=utf-8" }),
    });
  }
}

export default {
  fetch(request) {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          Allow: "GET",
          "Cache-Control": "no-store",
        },
      });
    }

    return GET(request);
  },
};
