// app.js

import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser"

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/message", messageRoutes);

export { app };