
import { createHash } from "node:crypto";

import {
    ActivityVisibility,
    AttachmentVisibility,
    AuditAction,
    AuditEntity,
    CaseActivityType,
    CaseStatus,
    NotificationType,
    PermissionCode,
    ResolutionStatus,
    StorageProvider,
    Prisma,
} from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { requireCompanyPermission } from "../middleware/authorization.js";
import { ServiceError } from "./case-management.service.js";
import {
    proposeResolutionSchema,
    uploadEvidenceSchema,
} from "../validation/case-management.js";
import {
    deleteEvidenceFile,
    storeEvidenceFile,
} from "./evidence-storage.service.js";

type CaseActionInput = {
    clerkUserId: string;
    companyId: string;
    caseId: string;
};

const ALLOWED_EVIDENCE_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "text/plain",
]);

const MAX_EVIDENCE_SIZE = 10 * 1024 * 1024; // 10 MB

async function ensureCaseExists(
    companyId: string,
    caseId: string,
) {
    const caseRecord = await prisma.case.findFirst({
        where: {
            id: caseId,
            companyId,
            deletedAt: null,
        },
        select: {
            id: true,
            caseNumber: true,
            status: true,
            requesterUserId: true,
        },
    });

    if (!caseRecord) {
        throw new ServiceError(404, "Case not found.");
    }

    return caseRecord;
}

// --------------------------------------------------
// UPLOAD EVIDENCE
// --------------------------------------------------

export async function uploadEvidenceService(
    args: CaseActionInput & {
        file?: Express.Multer.File;
        input: unknown;
    },
) {
    const { clerkUserId, companyId, caseId, file } = args;

    const input = uploadEvidenceSchema.parse(args.input);

    if (!file) {
        throw new ServiceError(400, "An evidence file is required.");
    }

    if (file.size <= 0 || file.size > MAX_EVIDENCE_SIZE) {
        throw new ServiceError(
            413,
            "Evidence must be between 1 byte and 10 MB.",
        );
    }

    if (!ALLOWED_EVIDENCE_TYPES.has(file.mimetype)) {
        throw new ServiceError(
            415,
            "Unsupported file type. Upload PDF, JPEG, PNG, WEBP, or TXT.",
        );
    }

    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.EVIDENCE_UPLOAD,
    });

    await ensureCaseExists(companyId, caseId);

    // Hash the contents for integrity checks and duplicate investigation.
    const checksumSha256 = createHash("sha256")
        .update(file.buffer)
        .digest("hex");

    // Upload first; if the DB transaction fails, remove the remote file.
    const storedFile = await storeEvidenceFile(
        file,
        companyId,
        caseId,
    );

    try {
        return await prisma.$transaction(async (tx) => {
            // Recheck the case in the transaction in case it was deleted
            // or otherwise changed while the file was being uploaded.
            const rows = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "Case"
        WHERE "id" = ${caseId}::uuid
          AND "companyId" = ${companyId}::uuid
          AND "deletedAt" IS NULL
        FOR UPDATE
      `;

            if (rows.length === 0) {
                throw new ServiceError(404, "Case not found.");
            }

            const evidence = await tx.evidence.create({
                data: {
                    companyId,
                    caseId,
                    uploadedByUserId: actor.userId,
                    originalFilename: file.originalname.slice(0, 255),
                    storageKey: storedFile.storageKey,
                    storageProvider: StorageProvider.CLOUDINARY,
                    mimeType: file.mimetype,
                    sizeBytes: file.size,
                    checksumSha256,
                    caption: input.caption ?? null,
                    visibility: input.visibility,
                },
            });

            await tx.caseActivity.create({
                data: {
                    companyId,
                    caseId,
                    actorUserId: actor.userId,
                    type: CaseActivityType.EVIDENCE_ADDED,
                    visibility:
                        input.visibility === AttachmentVisibility.REQUESTER_SHARED
                            ? ActivityVisibility.REQUESTER_VISIBLE
                            : ActivityVisibility.INTERNAL,
                    summary: "Evidence uploaded",
                    metadata: {
                        evidenceId: evidence.id,
                        filename: evidence.originalFilename,
                        mimeType: evidence.mimeType,
                        sizeBytes: evidence.sizeBytes,
                        visibility: evidence.visibility,
                    },
                },
            });

            await tx.auditLog.create({
                data: {
                    actorId: actor.userId,
                    companyId,
                    action: AuditAction.EVIDENCE_UPLOADED,
                    entity: AuditEntity.EVIDENCE,
                    entityId: evidence.id,
                    metadata: {
                        caseId,
                        storageProvider: StorageProvider.CLOUDINARY,
                        mimeType: evidence.mimeType,
                        sizeBytes: evidence.sizeBytes,
                        checksumSha256,
                    },
                },
            });

            await tx.case.update({
                where: { id: caseId },
                data: { lastActivityAt: new Date() },
            });

            return evidence;
        });
    } catch (error) {
        // Do not hide the original database/service error if cleanup fails.
        try {
            await deleteEvidenceFile(storedFile.storageKey);
        } catch (cleanupError) {
            console.error("Evidence cleanup failed:", {
                companyId,
                caseId,
                storageKey: storedFile.storageKey,
                error: cleanupError,
            });
        }

        throw error;
    }
}
