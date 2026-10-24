import {Router} from "express"
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { getCaseRequestController, getCaseRequestsController, getMyCaseRequestController, getMyCaseRequestsController, submitCaseRequestController } from "../controllers/case-request.controller.js";


const router = Router();

router.use(requireAuthentication)
router.get("/requests/me", getMyCaseRequestsController);
router.get("/requests/:requestId/me", getMyCaseRequestController);
router.post("/:companyId/requests", 
    submitCaseRequestController);

router.get("/:companyId/requests", getCaseRequestsController);
router.get("/:companyId/requests/:requestId", getCaseRequestController);

export default router;
