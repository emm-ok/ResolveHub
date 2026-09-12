import express from "express";
import type { Application } from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app: Application = express();

app.use(cors({
    origin: [env.CUSTOMER_URL, env.ADMIN_URL],
    credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running successfully" });
});

app.get("/users", async(req, res) => {
    const users = await prisma.user.findMany();
    res.status(200).json({ 
        success: true,
        message: "Users endpoint",
        data: users
    });
})

app.post("/users", async(req, res) => {
    const { name, email, password } = req.body;
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password
        }
    });
    
    res.status(201).json({ 
        success: true,
        message: "User created successfully",
        data: user
    });
});

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});