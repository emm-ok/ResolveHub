-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "SystemRoleType" AS ENUM ('OWNER', 'ADMIN', 'AGENT', 'INVESTIGATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PermissionCode" AS ENUM ('USER_READ', 'USER_UPDATE', 'COMPANY_SETTINGS_READ', 'COMPANY_SETTINGS_UPDATE', 'MEMBER_READ', 'MEMBER_INVITE', 'MEMBER_UPDATE', 'MEMBER_REMOVE', 'ROLE_READ', 'ROLE_MANAGE', 'CASE_REQUEST_READ', 'CASE_REQUEST_REVIEW', 'CASE_CREATE', 'CASE_READ', 'CASE_UPDATE', 'CASE_ASSIGN', 'CASE_ESCALATE', 'CASE_RESOLVE', 'CASE_CLOSE', 'CASE_REOPEN', 'COMMENT_CREATE', 'EVIDENCE_READ', 'EVIDENCE_UPLOAD', 'EVIDENCE_DELETE', 'RESOLUTION_PROPOSE', 'RESOLUTION_DECIDE', 'SLA_MANAGE', 'AUDIT_READ');

-- CreateEnum
CREATE TYPE "CaseRequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'DUPLICATE', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "RequestChannel" AS ENUM ('WEB_FORM', 'EMAIL', 'PHONE', 'CHAT', 'API', 'INTERNAL');

-- CreateEnum
CREATE TYPE "CaseCategory" AS ENUM ('BILLING', 'REFUND', 'PRODUCT_ISSUE', 'SERVICE_ISSUE', 'ACCOUNT_ACCESS', 'COMPLAINT', 'INQUIRY', 'OTHER');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'TRIAGED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_THIRD_PARTY', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CasePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "CaseOrigin" AS ENUM ('WEB_FORM', 'EMAIL', 'PHONE', 'CHAT', 'API', 'INTERNAL');

-- CreateEnum
CREATE TYPE "CommentVisibility" AS ENUM ('INTERNAL', 'REQUESTER_VISIBLE');

-- CreateEnum
CREATE TYPE "ActivityVisibility" AS ENUM ('INTERNAL', 'REQUESTER_VISIBLE');

-- CreateEnum
CREATE TYPE "AttachmentVisibility" AS ENUM ('INTERNAL', 'REQUESTER_SHARED');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('S3_COMPATIBLE', 'CLOUDINARY', 'OTHER');

-- CreateEnum
CREATE TYPE "ResolutionStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REQUEST_RECEIVED', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'CASE_ASSIGNED', 'CASE_UPDATED', 'NEW_COMMENT', 'RESOLUTION_PROPOSED', 'RESOLUTION_DECIDED', 'SLA_WARNING', 'SLA_BREACH', 'INVITATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CaseActivityType" AS ENUM ('CASE_CREATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNED', 'UNASSIGNED', 'COMMENT_ADDED', 'EVIDENCE_ADDED', 'RESOLUTION_PROPOSED', 'RESOLUTION_ACCEPTED', 'RESOLUTION_REJECTED', 'ESCALATED', 'REOPENED', 'SLA_BREACHED', 'REQUEST_LINKED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'INVITE', 'INVITATION_ACCEPTED', 'INVITATION_REVOKED', 'ROLE_CHANGED', 'MEMBER_SUSPENDED', 'MEMBER_REACTIVATED', 'MEMBER_REMOVED', 'CASE_REQUEST_SUBMITTED', 'CASE_REQUEST_REVIEWED', 'CASE_CREATED', 'CASE_ASSIGNED', 'CASE_UNASSIGNED', 'CASE_STATUS_CHANGED', 'CASE_PRIORITY_CHANGED', 'CASE_ESCALATED', 'CASE_RESOLVED', 'CASE_CLOSED', 'CASE_REOPENED', 'COMMENT_CREATED', 'EVIDENCE_UPLOADED', 'EVIDENCE_DOWNLOADED', 'RESOLUTION_PROPOSED', 'RESOLUTION_DECIDED', 'SLA_BREACHED', 'WEBHOOK_PROCESSED');

-- CreateEnum
CREATE TYPE "AuditEntity" AS ENUM ('USER', 'COMPANY', 'MEMBERSHIP', 'INVITATION', 'ROLE', 'PERMISSION', 'CASE_REQUEST', 'CASE', 'CASE_ASSIGNMENT', 'CASE_COMMENT', 'EVIDENCE', 'RESOLUTION', 'SLA_POLICY', 'NOTIFICATION', 'WEBHOOK_EVENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "WebhookProcessingStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "clerkId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL,
    "clerkOrganizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "publicIntakeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "clerkMembershipId" TEXT,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "department" TEXT,
    "jobTitle" TEXT,
    "employeeId" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suspendedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyRole" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "systemRole" "SystemRoleType",
    "clerkRoleKey" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "code" "PermissionCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "CompanyInvitation" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "invitedByMemberId" UUID,
    "acceptedByUserId" UUID,
    "email" TEXT NOT NULL,
    "clerkInvitationId" TEXT,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "department" TEXT,
    "jobTitle" TEXT,
    "employeeId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseRequest" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "submitterUserId" UUID,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterPhone" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "CaseCategory" NOT NULL DEFAULT 'OTHER',
    "requestedPriority" "CasePriority",
    "channel" "RequestChannel" NOT NULL DEFAULT 'WEB_FORM',
    "status" "CaseRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedByMemberId" UUID,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "requestId" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "CaseCategory" NOT NULL DEFAULT 'OTHER',
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "CasePriority" NOT NULL DEFAULT 'NORMAL',
    "origin" "CaseOrigin" NOT NULL DEFAULT 'INTERNAL',
    "createdByUserId" UUID NOT NULL,
    "requesterUserId" UUID,
    "requesterName" TEXT,
    "requesterEmail" TEXT,
    "requesterPhone" TEXT,
    "isEscalated" BOOLEAN NOT NULL DEFAULT false,
    "escalatedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAssignment" (
    "id" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "assignedByMemberId" UUID,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "CaseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseComment" (
    "id" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "authorUserId" UUID,
    "authorName" TEXT,
    "authorEmail" TEXT,
    "body" TEXT NOT NULL,
    "visibility" "CommentVisibility" NOT NULL DEFAULT 'INTERNAL',
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "requestId" UUID,
    "caseId" UUID,
    "uploadedByUserId" UUID,
    "originalFilename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT,
    "caption" TEXT,
    "visibility" "AttachmentVisibility" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseActivity" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "actorUserId" UUID,
    "type" "CaseActivityType" NOT NULL,
    "visibility" "ActivityVisibility" NOT NULL DEFAULT 'INTERNAL',
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseResolution" (
    "id" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "proposedByUserId" UUID NOT NULL,
    "decidedByUserId" UUID,
    "status" "ResolutionStatus" NOT NULL DEFAULT 'PROPOSED',
    "summary" TEXT NOT NULL,
    "details" TEXT,
    "decisionReason" TEXT,
    "proposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseResolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SLAPolicy" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "createdByUserId" UUID,
    "name" TEXT NOT NULL,
    "priority" "CasePriority" NOT NULL,
    "firstResponseMinutes" INTEGER NOT NULL,
    "resolutionMinutes" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SLAPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseSLA" (
    "id" UUID NOT NULL,
    "caseId" UUID NOT NULL,
    "policyId" UUID,
    "firstResponseTargetMinutes" INTEGER NOT NULL,
    "resolutionTargetMinutes" INTEGER NOT NULL,
    "firstResponseDueAt" TIMESTAMP(3) NOT NULL,
    "resolutionDueAt" TIMESTAMP(3) NOT NULL,
    "firstRespondedAt" TIMESTAMP(3),
    "firstResponseBreachedAt" TIMESTAMP(3),
    "resolutionBreachedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseSLA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "companyId" UUID,
    "action" "AuditAction" NOT NULL,
    "entity" "AuditEntity" NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "actionUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClerkWebhookEvent" (
    "id" UUID NOT NULL,
    "clerkEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" "WebhookProcessingStatus" NOT NULL DEFAULT 'RECEIVED',
    "payload" JSONB NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClerkWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_platformRole_idx" ON "User"("platformRole");

-- CreateIndex
CREATE UNIQUE INDEX "Company_clerkOrganizationId_key" ON "Company"("clerkOrganizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_status_createdAt_idx" ON "Company"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_clerkMembershipId_key" ON "CompanyMember"("clerkMembershipId");

-- CreateIndex
CREATE INDEX "CompanyMember_companyId_employeeId_idx" ON "CompanyMember"("companyId", "employeeId");

-- CreateIndex
CREATE INDEX "CompanyMember_companyId_status_idx" ON "CompanyMember"("companyId", "status");

-- CreateIndex
CREATE INDEX "CompanyMember_userId_status_idx" ON "CompanyMember"("userId", "status");

-- CreateIndex
CREATE INDEX "CompanyMember_roleId_idx" ON "CompanyMember"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_userId_companyId_key" ON "CompanyMember"("userId", "companyId");

-- CreateIndex
CREATE INDEX "CompanyRole_companyId_systemRole_idx" ON "CompanyRole"("companyId", "systemRole");

-- CreateIndex
CREATE INDEX "CompanyRole_companyId_clerkRoleKey_idx" ON "CompanyRole"("companyId", "clerkRoleKey");

-- CreateIndex
CREATE INDEX "CompanyRole_companyId_idx" ON "CompanyRole"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyRole_companyId_slug_key" ON "CompanyRole"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInvitation_clerkInvitationId_key" ON "CompanyInvitation"("clerkInvitationId");

-- CreateIndex
CREATE INDEX "CompanyInvitation_companyId_status_idx" ON "CompanyInvitation"("companyId", "status");

-- CreateIndex
CREATE INDEX "CompanyInvitation_email_status_idx" ON "CompanyInvitation"("email", "status");

-- CreateIndex
CREATE INDEX "CompanyInvitation_expiresAt_idx" ON "CompanyInvitation"("expiresAt");

-- CreateIndex
CREATE INDEX "CaseRequest_companyId_status_createdAt_idx" ON "CaseRequest"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "CaseRequest_companyId_requesterEmail_idx" ON "CaseRequest"("companyId", "requesterEmail");

-- CreateIndex
CREATE INDEX "CaseRequest_submitterUserId_idx" ON "CaseRequest"("submitterUserId");

-- CreateIndex
CREATE INDEX "CaseRequest_reviewedByMemberId_idx" ON "CaseRequest"("reviewedByMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseRequest_companyId_requestNumber_key" ON "CaseRequest"("companyId", "requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Case_requestId_key" ON "Case"("requestId");

-- CreateIndex
CREATE INDEX "Case_companyId_status_updatedAt_idx" ON "Case"("companyId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "Case_companyId_priority_createdAt_idx" ON "Case"("companyId", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "Case_companyId_isEscalated_status_idx" ON "Case"("companyId", "isEscalated", "status");

-- CreateIndex
CREATE INDEX "Case_createdByUserId_idx" ON "Case"("createdByUserId");

-- CreateIndex
CREATE INDEX "Case_requesterUserId_idx" ON "Case"("requesterUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_companyId_caseNumber_key" ON "Case"("companyId", "caseNumber");

-- CreateIndex
CREATE INDEX "CaseAssignment_caseId_unassignedAt_idx" ON "CaseAssignment"("caseId", "unassignedAt");

-- CreateIndex
CREATE INDEX "CaseAssignment_memberId_unassignedAt_idx" ON "CaseAssignment"("memberId", "unassignedAt");

-- CreateIndex
CREATE INDEX "CaseAssignment_assignedByMemberId_idx" ON "CaseAssignment"("assignedByMemberId");

-- CreateIndex
CREATE INDEX "CaseComment_caseId_createdAt_idx" ON "CaseComment"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseComment_authorUserId_idx" ON "CaseComment"("authorUserId");

-- CreateIndex
CREATE INDEX "CaseComment_caseId_visibility_createdAt_idx" ON "CaseComment"("caseId", "visibility", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_storageKey_key" ON "Evidence"("storageKey");

-- CreateIndex
CREATE INDEX "Evidence_companyId_caseId_createdAt_idx" ON "Evidence"("companyId", "caseId", "createdAt");

-- CreateIndex
CREATE INDEX "Evidence_companyId_requestId_createdAt_idx" ON "Evidence"("companyId", "requestId", "createdAt");

-- CreateIndex
CREATE INDEX "Evidence_uploadedByUserId_idx" ON "Evidence"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "CaseActivity_companyId_createdAt_idx" ON "CaseActivity"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseActivity_caseId_createdAt_idx" ON "CaseActivity"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseActivity_actorUserId_idx" ON "CaseActivity"("actorUserId");

-- CreateIndex
CREATE INDEX "CaseActivity_caseId_visibility_createdAt_idx" ON "CaseActivity"("caseId", "visibility", "createdAt");

-- CreateIndex
CREATE INDEX "CaseResolution_caseId_status_proposedAt_idx" ON "CaseResolution"("caseId", "status", "proposedAt");

-- CreateIndex
CREATE INDEX "CaseResolution_proposedByUserId_idx" ON "CaseResolution"("proposedByUserId");

-- CreateIndex
CREATE INDEX "CaseResolution_decidedByUserId_idx" ON "CaseResolution"("decidedByUserId");

-- CreateIndex
CREATE INDEX "SLAPolicy_companyId_priority_isActive_idx" ON "SLAPolicy"("companyId", "priority", "isActive");

-- CreateIndex
CREATE INDEX "SLAPolicy_createdByUserId_idx" ON "SLAPolicy"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SLAPolicy_companyId_name_key" ON "SLAPolicy"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CaseSLA_caseId_key" ON "CaseSLA"("caseId");

-- CreateIndex
CREATE INDEX "CaseSLA_firstResponseDueAt_idx" ON "CaseSLA"("firstResponseDueAt");

-- CreateIndex
CREATE INDEX "CaseSLA_resolutionDueAt_idx" ON "CaseSLA"("resolutionDueAt");

-- CreateIndex
CREATE INDEX "CaseSLA_firstResponseBreachedAt_idx" ON "CaseSLA"("firstResponseBreachedAt");

-- CreateIndex
CREATE INDEX "CaseSLA_resolutionBreachedAt_idx" ON "CaseSLA"("resolutionBreachedAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_createdAt_idx" ON "AuditLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_companyId_createdAt_idx" ON "Notification"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClerkWebhookEvent_clerkEventId_key" ON "ClerkWebhookEvent"("clerkEventId");

-- CreateIndex
CREATE INDEX "ClerkWebhookEvent_status_receivedAt_idx" ON "ClerkWebhookEvent"("status", "receivedAt");

-- CreateIndex
CREATE INDEX "ClerkWebhookEvent_eventType_receivedAt_idx" ON "ClerkWebhookEvent"("eventType", "receivedAt");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "CompanyRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyRole" ADD CONSTRAINT "CompanyRole_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "CompanyRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInvitation" ADD CONSTRAINT "CompanyInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInvitation" ADD CONSTRAINT "CompanyInvitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "CompanyRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInvitation" ADD CONSTRAINT "CompanyInvitation_invitedByMemberId_fkey" FOREIGN KEY ("invitedByMemberId") REFERENCES "CompanyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInvitation" ADD CONSTRAINT "CompanyInvitation_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseRequest" ADD CONSTRAINT "CaseRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseRequest" ADD CONSTRAINT "CaseRequest_submitterUserId_fkey" FOREIGN KEY ("submitterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseRequest" ADD CONSTRAINT "CaseRequest_reviewedByMemberId_fkey" FOREIGN KEY ("reviewedByMemberId") REFERENCES "CompanyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CaseRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "CompanyMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_assignedByMemberId_fkey" FOREIGN KEY ("assignedByMemberId") REFERENCES "CompanyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseComment" ADD CONSTRAINT "CaseComment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseComment" ADD CONSTRAINT "CaseComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CaseRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseActivity" ADD CONSTRAINT "CaseActivity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseActivity" ADD CONSTRAINT "CaseActivity_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseActivity" ADD CONSTRAINT "CaseActivity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseResolution" ADD CONSTRAINT "CaseResolution_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseResolution" ADD CONSTRAINT "CaseResolution_proposedByUserId_fkey" FOREIGN KEY ("proposedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseResolution" ADD CONSTRAINT "CaseResolution_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLAPolicy" ADD CONSTRAINT "SLAPolicy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SLAPolicy" ADD CONSTRAINT "SLAPolicy_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSLA" ADD CONSTRAINT "CaseSLA_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSLA" ADD CONSTRAINT "CaseSLA_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "SLAPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
