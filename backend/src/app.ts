import express from "express";
import type { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { env } from "./config/env.js";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running successfully" });
});

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});