import {Router} from "express";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { createComment } from "../controllers/case-management.controller.js";


const router = Router();

router.use(requireAuthentication)
// router.get(
//     "/:companyId/cases/:caseId/comments",
//     getCaseComments,
// );

router.post("/:companyId/cases/:caseId/comments", createComment)

// router.delete(
//     "/:companyId/cases/:caseId/comments/:commentId",
//     deleteComment,
// );

export default router;