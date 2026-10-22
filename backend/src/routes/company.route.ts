import { Router } from "express";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import {
    createCompanyController,
    getCompaniesController,
    getCompanyController,
    updateCompanyController,
    deactivateCompanyController,
} from "../controllers/company.controller.js";

const router = Router();

// router.use(requireAuthentication)
// Existing endpoint — retain its current validation and behavior.
router.post("/", createCompanyController);

// List the authenticated user's active company memberships.
router.get("/", getCompaniesController);

// Read company settings.
router.get("/:companyId", getCompanyController);

// Update company settings.
router.patch("/:companyId", updateCompanyController);

// Soft-deactivate a company.
router.delete("/:companyId", deactivateCompanyController);

export default router;