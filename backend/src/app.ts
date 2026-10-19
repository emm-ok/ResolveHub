import express from "express";
import type { Application } from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

import webhookRoutes from "./routes/webhook.routes.js";
import userRoutes from "./routes/user.routes.js";
import { clerkMiddleware } from "@clerk/express";
import caseRequestRoutes from "./routes/case-request.route.js";
import companyRoutes from "./routes/company.route.js";

const app: Application = express();

app.use(cors({
    origin: [env.CUSTOMER_URL, env.ADMIN_URL],
    credentials: true,
}));

app.use("/api/webhooks", webhookRoutes)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(clerkMiddleware())

app.use("/api/users", userRoutes);
app.use("/api/case-requests", caseRequestRoutes);
app.use("/api/companies", companyRoutes);

// app.get("/users", async(req, res) => {
//     const users = await prisma.user.findMany();
//     res.status(200).json({ 
//         success: true,
//         message: "Users endpoint",
//         data: users
//     });
// })

app.get("/user", async(req, res) => {
    const user =  await prisma.user.findUnique({
        where: {
            clerkId: "user_3Kt4iD1XmFZkbhcB0pkMDxyyhpB"
        }
    })

    if(!user) {
        return res.json({
            message: "user not found"
        })
    }

    return res.json({
        message: `User with id ${user.clerkId} fetched successfully`,
        user
    })
})

// app.get("/", (req, res) => {
//     res.status(200).json({ message: "Server is running successfully" });
// });

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});