import {Router} from "express"
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { acceptCaseRequestController, rejectCaseRequestController, submitCaseRequestController } from "../controllers/case-request.controller.js";


const router = Router();

router.post("/:companyId/requests", 
    // requireAuthentication, 
    submitCaseRequestController);

// router.get("/:companyId/requests", requireAuthentication, getCaseRequests);

router.post("/:companyId/requests/:requestId/accept", 
    // requireAuthentication, 
    acceptCaseRequestController)
router.post("/:companyId/requests/:requestId/reject", 
    // requireAuthentication, 
    rejectCaseRequestController)


// router.get("/:companyId/cases", requireAuthentication, getCases)
// router.get("/:companyId/cases/:caseId", requireAuthentication, getCaseDetails)

// router.patch("/:companyId/cases/:caseId", requireAuthentication, updateCaseDetails)

// router.post("/:companyId/cases/:caseId/assignments", requireAuthentication, assignCase)
// router.post("/:companyId/cases/:caseId/comments", requireAuthentication, createComment)

// router.post("/:companyId/cases/:caseId/evidence", requireAuthentication, uploadEvidence)

// router.post("/:companyId/cases/:caseId/resolutions", requireAuthentication, proposeResolution)


export default router;
