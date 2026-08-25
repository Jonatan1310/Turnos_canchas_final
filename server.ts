import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { apiRouter } from "./src/server/apiRouter";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount API router
  app.use("/api", apiRouter);

  // Vite middleware for development / Static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Node.js Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
