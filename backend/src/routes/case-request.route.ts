import {Router} from "express"
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { acceptCaseRequestController, getCaseDetailsController, getCaseRequestController, getCaseRequestsController, getCasesController, rejectCaseRequestController, submitCaseRequestController } from "../controllers/case-request.controller.js";
import { assignCase, createComment, updateCaseDetails } from "../controllers/case-management.controller.js";
import { evidenceUpload } from "../config/upload.js";
import { proposeResolution, uploadEvidence } from "../controllers/case-evidence-resolution.controller.js";


const router = Router();

// router.use(requireAuthentication)
router.post("/:companyId/requests", 
    submitCaseRequestController);

router.get("/:companyId/requests", getCaseRequestsController);
router.get("/:companyId/requests/:requestId", getCaseRequestController);

router.post("/:companyId/requests/:requestId/accept", acceptCaseRequestController)
router.post("/:companyId/requests/:requestId/reject", rejectCaseRequestController)


router.get("/:companyId/cases", getCasesController)
router.get("/:companyId/cases/:caseId", getCaseDetailsController)

router.patch("/:companyId/cases/:caseId", updateCaseDetails)

router.post("/:companyId/cases/:caseId/assignments", assignCase)
router.post("/:companyId/cases/:caseId/comments", createComment)

router.post(
    "/:companyId/cases/:caseId/evidence",
    evidenceUpload.single("file"),
    uploadEvidence,
);

router.post("/:companyId/cases/:caseId/resolutions", proposeResolution)


export default router;
