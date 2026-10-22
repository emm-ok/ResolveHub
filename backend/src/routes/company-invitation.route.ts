import {Router} from "express";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { sendCompanyInvitationController } from "../controllers/company-invitation.controller.js";


const router = Router();

router.use(requireAuthentication)

router.post(
    "/:companyId/invitations",
    sendCompanyInvitationController,
);


export default router