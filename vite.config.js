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

          let statusCode = 200;
          const headers = {
            "Content-Type": "application/json",
          };

          const mockRes = {
            status(code) {
              statusCode = code;
              return mockRes;
            },
            setHeader(name, value) {
              headers[name] = value;
            },
            json(payload) {
              res.statusCode = statusCode;
              Object.entries(headers).forEach(([key, value]) => {
                res.setHeader(key, value);
              });
              res.end(JSON.stringify(payload));
            },
            end(payload) {
              res.statusCode = statusCode;
              Object.entries(headers).forEach(([key, value]) => {
                res.setHeader(key, value);
              });
              res.end(payload);
            },
          };

          await apiModule.default(req, mockRes);
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
