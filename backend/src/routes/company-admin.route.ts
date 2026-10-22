import { Router } from "express";

import { requireAuthentication } from "../middleware/auth.middleware.js";

import {
    getAllCompaniesController,
    getAuditLogsController,
    reactivateCompanyController,
} from "../controllers/company-admin.controller.js";

const router = Router();

// router.use(requireAuthentication);

// GET /api/admin/companies
router.get("/companies", getAllCompaniesController);

// POST /api/admin/companies/:companyId/reactivate
router.post(
    "/companies/:companyId/reactivate",
    reactivateCompanyController,
);

// GET /api/admin/audit-logs
// Optional filters: companyId, page, limit, action, entity, entityId
router.get("/audit-logs", getAuditLogsController);

export default router;