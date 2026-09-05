import express from "express";
import type { Application } from "express";
import cors from "cors";
import { env } from "./config/env.js";

const app: Application = express();

app.use(cors({
    origin: [env.CUSTOMER_URL, env.ADMIN_URL],
    credentials: true,
}));

app.use(express.json());


app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running successfully" });
});

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});