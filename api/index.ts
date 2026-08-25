import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { apiRouter } from "../src/server/apiRouter";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes for /api/* and direct /* paths in Vercel
app.use("/api", apiRouter);
app.use("/", apiRouter);

export default app;
