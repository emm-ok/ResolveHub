import {Router} from "express";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { acceptCaseRequestController, getCaseDetailsController, getCasesController, rejectCaseRequestController } from "../controllers/case-request.controller.js";
import { assignCase, getCaseActivities, getCaseAssignments, unassignCase, updateCaseDetails } from "../controllers/case-management.controller.js";


const router = Router();

// router.use(requireAuthentication)

router.get("/:companyId/cases", getCasesController)
router.get("/:companyId/cases/:caseId", getCaseDetailsController)

router.post("/:companyId/requests/:requestId/accept", acceptCaseRequestController)
router.post("/:companyId/requests/:requestId/reject", rejectCaseRequestController)


// TODO: Test endpoints below
router.patch("/:companyId/cases/:caseId", updateCaseDetails)

router.post("/:companyId/cases/:caseId/assignments/:memberId", assignCase)
router.delete(
    "/:companyId/cases/:caseId/assignments/:assignmentId",
    unassignCase,
);

router.get(
    "/:companyId/cases/:caseId/assignments",
    getCaseAssignments,
);


router.get(
    "/:companyId/cases/:caseId/activities",
    getCaseActivities,
);

export default router;