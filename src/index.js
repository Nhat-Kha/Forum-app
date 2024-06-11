import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

import http from "http";
import express from "express";
import cors from "cors";

import { rateLimit } from "express-rate-limit";
import createHttpError from "http-errors";

import DB from "./DB/DB.js";
import authRouter from "./routes/auth.js";

const app = express();
const httpServer = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "..", "/public")));
app.use(express.static(path.join(__dirname, "..", "client", "build")));
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

const limited = rateLimit({
  windowMs: 1 * 60 * 100,
  max: 50,
  message: { error: { status: 429, message: "too much request per minute" } },
});

// app.get("/", (req, res) => res.send({ message: "App worked successfully" }));

app.use("/auth", limited);
app.use("/api", limited);

app.use("/auth", authRouter);

app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const PORT = process.env.PORT || 4000;

DB()
  .then(() => {
    console.log("Connect to MONGO success");
    httpServer.listen({ port: PORT }, () => {
      console.log(`Server run on ${process.env.BACKEND}`);
    });
  })
  .catch((error) => console.log(`Connect Faile on PORT, message:`, error));
