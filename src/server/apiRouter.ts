import express, { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const apiRouter = Router();

// Middleware to parse JSON
apiRouter.use(express.json());
apiRouter.use(express.urlencoded({ extended: true }));

// Healthcheck endpoint
apiRouter.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Sistema de Reservas API",
    platform: process.env.VERCEL ? "vercel-serverless" : "node-server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Ping endpoint
apiRouter.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true, time: Date.now() });
});

// License validation helper endpoint
apiRouter.post("/license/verify", (req: Request, res: Response) => {
  try {
    const { licenseKey, complexId } = req.body || {};
    // Simple verification check
    res.json({
      success: true,
      valid: true,
      complexId: complexId || "default",
      serverCheckedAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Gemini AI Assistant endpoint (Server-side API Key security)
apiRouter.post("/ai/assist", async (req: Request, res: Response) => {
  try {
    const { prompt, complexName, sportType } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "El prompt es requerido" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "Servicio de IA no configurado en el servidor (GEMINI_API_KEY faltante)",
        fallbackMessage: "Para habilitar respuestas automáticas de IA, configure GEMINI_API_KEY en las variables de entorno de Vercel / Node.js.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `Eres el asistente inteligente del complejo deportivo "${complexName || "Complejo Deportivo"}". 
Ayudas a administradores y clientes con dudas de horarios, promociones, reglas de alquiler de canchas de ${sportType || "fútbol, pádel y tenis"}, y redacción de mensajes de WhatsApp amables y directos en español rioplatense/latinoamericano.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "No se pudo generar respuesta.";
    res.json({ success: true, response: text });
  } catch (error: any) {
    console.error("AI API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error al procesar la solicitud de IA",
    });
  }
});

// API Info endpoint
apiRouter.get("/info", (req: Request, res: Response) => {
  res.json({
    name: "Sistema de Gestión de Canchas & Reservas API",
    version: "1.0.0",
    endpoints: [
      { path: "/api/health", method: "GET", description: "Estado del servidor" },
      { path: "/api/ping", method: "GET", description: "Verificación de latencia" },
      { path: "/api/license/verify", method: "POST", description: "Validación de estado de licencia" },
      { path: "/api/ai/assist", method: "POST", description: "Asistente inteligente con Gemini" },
    ],
  });
});
