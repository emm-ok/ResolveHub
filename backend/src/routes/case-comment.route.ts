import {Router} from "express";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import { createComment, deleteComment, getCaseComments } from "../controllers/case-comment.controller.js";


const router = Router();

// router.use(requireAuthentication)

router.get(
    "/:companyId/cases/:caseId/comments",
    getCaseComments,
);

router.post("/:companyId/cases/:caseId/comments", createComment)

router.delete(
    "/:companyId/cases/:caseId/comments/:commentId",
    deleteComment,
);

export default router;