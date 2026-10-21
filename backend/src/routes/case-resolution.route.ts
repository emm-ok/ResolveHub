import {Router} from "express";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { proposeResolution } from "../controllers/case-resolution.controller.js";


const router = Router();

router.use(requireAuthentication)

// router.get(
//     "/:companyId/cases/:caseId/resolutions",
//     getCaseResolutions,
// );

router.post("/:companyId/cases/:caseId/resolutions", proposeResolution)

// router.post(
//     "/:companyId/cases/:caseId/resolutions/:resolutionId/accept",
//     acceptResolution,
// );

// router.post(
//     "/:companyId/cases/:caseId/resolutions/:resolutionId/reject",
//     rejectResolution,
// );

// router.post(
//     "/:companyId/cases/:caseId/resolutions/:resolutionId/withdraw",
//     withdrawResolution,
// );

export default router;