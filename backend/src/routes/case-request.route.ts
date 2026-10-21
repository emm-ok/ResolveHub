import {Router} from "express"
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { getCaseRequestController, getCaseRequestsController, submitCaseRequestController } from "../controllers/case-request.controller.js";


const router = Router();

// router.use(requireAuthentication)
router.post("/:companyId/requests", 
    submitCaseRequestController);

router.get("/:companyId/requests", getCaseRequestsController);
router.get("/:companyId/requests/:requestId", getCaseRequestController);

export default router;
