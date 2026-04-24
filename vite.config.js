import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function localApiMiddleware() {
  return {
    name: "local-api-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];

        if (pathname !== "/api/games") {
          next();
          return;
        }

        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }

        try {
          const apiModule = await server.ssrLoadModule(
            path.resolve(__dirname, "api/games.js")
          );

          const request = new Request(`http://localhost:5173${req.url}`, {
            method: req.method,
            headers: req.headers,
          });

          let response;

          if (typeof apiModule.GET === "function") {
            response = await apiModule.GET(request);
          } else if (typeof apiModule.default?.fetch === "function") {
            response = await apiModule.default.fetch(request);
          } else {
            throw new Error("API module nao exporta GET nem default.fetch");
          }

          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });
          res.end(await response.text());
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localApiMiddleware()],
});
