
import { Router } from "express";
import {
    getCompanyDashboardController,
    getCompanyReportsController,
} from "../controllers/company-reporting.controller.js";
import { requireAuthentication } from "../middleware/auth.middleware.js";

const router = Router();

// router.use(requireAuthentication)

router.get(
    "/:companyId/dashboard",
    getCompanyDashboardController,
);

router.get(
    "/:companyId/reports",
    getCompanyReportsController,
);


export default router;