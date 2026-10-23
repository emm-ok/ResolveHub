import {Router} from "express";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { evidenceUpload } from "../config/upload.js";
import { 
    // deleteCaseEvidenceController, 
    deleteEvidence, 
    downloadCaseEvidenceController, 
    getCaseEvidence, 
    getEvidenceDetails, 
    uploadEvidence 
} from "../controllers/case-evidence.controller.js";


const router = Router();

// router.use(requireAuthentication)

router.get(
    "/:companyId/cases/:caseId/evidence",
    getCaseEvidence,
);

router.get(
    "/:companyId/cases/:caseId/evidence/:evidenceId",
    getEvidenceDetails,
);

router.post(
    "/:companyId/cases/:caseId/evidence",
    evidenceUpload.single("file"),
    uploadEvidence,
);

router.delete(
    "/:companyId/cases/:caseId/evidence/:evidenceId",
    deleteEvidence,
);


router.get(
    "/:companyId/cases/:caseId/evidence/:evidenceId/download",
    downloadCaseEvidenceController,
);

// router.delete(
//     "/:companyId/cases/:caseId/evidence/:evidenceId",
//     deleteCaseEvidenceController,
// );


export default router;