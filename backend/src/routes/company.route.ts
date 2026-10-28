import { Router } from "express";
import { requireAuthentication } from "../middleware/auth.middleware.js";
import {
    createCompanyController,
    getCompaniesController,
    getCompanyController,
    updateCompanyController,
    deactivateCompanyController,
    getAllCompanies,
    getMyCompanyDashboardController,
    getCompanyRolesController,
} from "../controllers/company.controller.js";
import { acceptCompanyInvitationController, getCompanyInvitationController, getCompanyInvitationsController, sendCompanyInvitationController } from "../controllers/company-invitation.controller.js";
import {
    getCompanyMembersController,
    removeCompanyMemberController,
    updateCompanyMemberController,
} from "../controllers/company-member.controller.js";

const router = Router();

router.use(requireAuthentication)
// Existing endpoint — retain its current validation and behavior.
router.post("/", createCompanyController);

// List all active companies
router.get("/all-companies", getAllCompanies)

router.get("/me", getMyCompanyDashboardController);

// List the authenticated user's active company memberships.
router.get("/", getCompaniesController);

router.post("/accept", acceptCompanyInvitationController);

router.get("/:companyId/invitations", getCompanyInvitationsController);

router.post("/:companyId/invitations", sendCompanyInvitationController,);

router.get("/:companyId/invitations/:invitationId", getCompanyInvitationController);


router.get("/:companyId/members", getCompanyMembersController);

router.patch("/:companyId/members/:memberId", updateCompanyMemberController);

router.delete("/:companyId/members/:memberId", removeCompanyMemberController);

router.get("/:companyId/roles", getCompanyRolesController);
// Read company settings.
router.get("/:companyId", getCompanyController);

// Update company settings.
router.patch("/:companyId", updateCompanyController);

// Soft-deactivate a company.
router.delete("/:companyId", deactivateCompanyController);

export default router;