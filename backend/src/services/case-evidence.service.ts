
import { createHash } from "node:crypto";

import {
    ActivityVisibility,
    AttachmentVisibility,
    AuditAction,
    AuditEntity,
    CaseActivityType,
    PermissionCode,
    StorageProvider,
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

type EvidenceQueryInput = {
    clerkUserId: string;
    companyId: string;
    caseId: string;
};

type EvidenceDetailsInput = EvidenceQueryInput & {
    evidenceId: string;
};

type DeleteEvidenceInput = EvidenceDetailsInput;

/**
 * Return a paginated list of evidence records.
 * Never return storage keys or private storage URLs.
 */
export async function getCaseEvidenceService({
    clerkUserId,
    companyId,
    caseId,
    page = 1,
    limit = 20,
}: EvidenceQueryInput & {
    page?: number;
    limit?: number;
}) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.EVIDENCE_READ,
    });

    await ensureCaseExists(companyId, caseId);

    const where = {
        companyId,
        caseId,
    };

    const [items, total] = await prisma.$transaction([
        prisma.evidence.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                originalFilename: true,
                mimeType: true,
                sizeBytes: true,
                caption: true,
                visibility: true,
                createdAt: true,
                uploadedByUserId: true,
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        }),
        prisma.evidence.count({ where }),
    ]);

    return {
        items: items.map((item) => ({
            id: item.id,
            filename: item.originalFilename,
            mimeType: item.mimeType,
            sizeBytes: item.sizeBytes,
            caption: item.caption,
            visibility: item.visibility,
            createdAt: item.createdAt,
            uploadedBy: item.uploadedBy
                ? {
                    id: item.uploadedBy.id,
                    name: item.uploadedBy.name,
                    avatarUrl: item.uploadedBy.avatarUrl,
                }
                : null,
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/**
 * Return one evidence record scoped to its company and case.
 */
export async function getEvidenceDetailsService({
    clerkUserId,
    companyId,
    caseId,
    evidenceId,
}: EvidenceDetailsInput) {
    await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.EVIDENCE_READ,
    });

    await ensureCaseExists(companyId, caseId);

    const evidence = await prisma.evidence.findFirst({
        where: {
            id: evidenceId,
            companyId,
            caseId,
        },
        select: {
            id: true,
            originalFilename: true,
            mimeType: true,
            sizeBytes: true,
            checksumSha256: true,
            caption: true,
            visibility: true,
            createdAt: true,
            uploadedBy: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });

    if (!evidence) {
        throw new ServiceError(404, "Evidence not found.");
    }

    return {
        id: evidence.id,
        filename: evidence.originalFilename,
        mimeType: evidence.mimeType,
        sizeBytes: evidence.sizeBytes,
        checksumSha256: evidence.checksumSha256,
        caption: evidence.caption,
        visibility: evidence.visibility,
        createdAt: evidence.createdAt,
        uploadedBy: evidence.uploadedBy
            ? {
                id: evidence.uploadedBy.id,
                name: evidence.uploadedBy.name,
                avatarUrl: evidence.uploadedBy.avatarUrl,
            }
            : null,
    };
}

/**
 * Delete evidence metadata, record the audit event, then remove
 * the stored file. The database changes are committed atomically.
 */
export async function deleteEvidenceService({
    clerkUserId,
    companyId,
    caseId,
    evidenceId,
}: DeleteEvidenceInput) {
    const actor = await requireCompanyPermission({
        clerkUserId,
        companyId,
        permission: PermissionCode.EVIDENCE_DELETE,
    });

    const deletedEvidence = await prisma.$transaction(async (tx) => {
        // Prevent concurrent deletion or case-level changes from
        // bypassing the case/company scope check.
        const lockedCase = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "Case"
      WHERE "id" = ${caseId}::uuid
        AND "companyId" = ${companyId}::uuid
        AND "deletedAt" IS NULL
      FOR UPDATE
    `;

        if (lockedCase.length === 0) {
            throw new ServiceError(404, "Case not found.");
        }

        console.log("EvidenceId", evidenceId)
        const evidence = await tx.evidence.findFirst({
            where: {
                id: evidenceId,
                companyId,
                caseId,
            },
            select: {
                id: true,
                originalFilename: true,
                storageKey: true,
                storageProvider: true,
            },
        });

        if (!evidence) {
            throw new ServiceError(404, "Evidence not found.");
        }

        await tx.evidence.delete({
            where: { id: evidence.id },
        });

        const deletedAt = new Date();

        await tx.auditLog.create({
            data: {
                actorId: actor.userId,
                companyId,
                action: AuditAction.DELETE,
                entity: AuditEntity.EVIDENCE,
                entityId: evidence.id,
                metadata: {
                    caseId,
                    filename: evidence.originalFilename,
                    storageProvider: evidence.storageProvider,
                },
            },
        });

        await tx.case.update({
            where: { id: caseId },
            data: { lastActivityAt: deletedAt },
        });

        // Internal cleanup data is used only after the transaction.
        return {
            id: evidence.id,
            storageKey: evidence.storageKey,
            storageProvider: evidence.storageProvider,
            deletedAt,
        };
    });

    // Storage and PostgreSQL cannot share one transaction. If file
    // cleanup fails, log it for reconciliation rather than exposing
    // the storage key or returning it to the client.
    try {
        if (deletedEvidence.storageProvider !== "CLOUDINARY") {
            throw new Error(
                `Unsupported evidence storage provider: ${deletedEvidence.storageProvider}`,
            );
        }

        await deleteEvidenceFile(deletedEvidence.storageKey);
    } catch (error) {
        console.error("Evidence storage cleanup failed.", {
            evidenceId: deletedEvidence.id,
            caseId,
            error,
        });
    }

    return {
        id: deletedEvidence.id,
        deletedAt: deletedEvidence.deletedAt,
    };
}