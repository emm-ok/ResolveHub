import express, { Router } from "express";
import { clerkWebhook } from "../modules/webhooks/clerk/clerk.webhook.js";

const router = Router();

router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook
);

export default router;