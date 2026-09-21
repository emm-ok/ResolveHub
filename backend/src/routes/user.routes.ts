import { Router } from "express";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { getUserByClerkId } from "../modules/users/user.controller.js";


const router = Router();

router.get("/me", requireAuthentication, getUserByClerkId);

export default router;