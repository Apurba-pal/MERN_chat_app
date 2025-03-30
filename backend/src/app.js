// app.js

import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json({ limit: "10mb" })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Increase URL-encoded payload limit
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Fix CORS configuration

app.use("/auth", authRoutes); // Remove invalid token
app.use("/message", messageRoutes); // Remove invalid token

export { app };
