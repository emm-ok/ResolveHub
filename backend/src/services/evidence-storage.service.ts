
import { randomUUID } from "node:crypto";
import cloudinary from "../config/cloudinary.js";
import {
    StorageProvider,
} from "@prisma/client";
import { ServiceError } from "./case-management.service.js";

type CloudinaryResourceType = "image" | "video" | "raw";

type UploadedEvidenceFile = {
    storageKey: string;
    secureUrl: string;
};

export async function storeEvidenceFile(
    file: Express.Multer.File,
    companyId: string,
    caseId: string,
): Promise<UploadedEvidenceFile> {
    const folder = `resolvehub/evidence/${companyId}/${caseId}`;

    const result = await new Promise<{
        public_id: string;
        resource_type: CloudinaryResourceType;
        secure_url: string;
    }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: randomUUID(),
                resource_type: "auto",
                type: "authenticated",
                overwrite: false,
                use_filename: false,
            },
            (error, uploaded) => {
                if (error || !uploaded) {
                    reject(error ?? new Error("Evidence upload failed."));
                    return;
                }

                resolve({
                    public_id: uploaded.public_id,
                    resource_type: uploaded.resource_type as CloudinaryResourceType,
                    secure_url: uploaded.secure_url,
                });
            },
        );

        stream.end(file.buffer);
    });

    return {
        // Format: resource_type:public_id
        storageKey: `${result.resource_type}:${result.public_id}`,
        secureUrl: result.secure_url,
    };
}

export async function deleteEvidenceFile(
    storageKey: string,
): Promise<void> {
    const separator = storageKey.indexOf(":");

    if (separator === -1) {
        throw new Error("Invalid evidence storage key.");
    }

    const resourceType = storageKey.slice(0, separator);
    const publicId = storageKey.slice(separator + 1);

    if (
        !["image", "video", "raw"].includes(resourceType) ||
        !publicId
    ) {
        throw new Error("Invalid evidence storage key.");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType as CloudinaryResourceType,
        type: "authenticated",
        invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Could not clean up uploaded evidence.");
    }
}


const DOWNLOAD_URL_TTL_SECONDS = 5 * 60;

function getCloudinaryResourceType(mimeType: string): "image" | "raw" {
    return mimeType.startsWith("image/") ? "image" : "raw";
}

export async function createEvidenceDownloadUrl({
    storageProvider,
    storageKey,
    mimeType,
    originalFilename,
}: {
    storageProvider: StorageProvider;
    storageKey: string;
    mimeType: string;
    originalFilename: string;
}): Promise<{ url: string; expiresAt: Date }> {
    if (storageProvider !== StorageProvider.CLOUDINARY) {
        throw new ServiceError(
            501,
            "Secure downloads are not configured for this storage provider.",
        );
    }

    const expiresAt = new Date(
        Date.now() + DOWNLOAD_URL_TTL_SECONDS * 1000,
    );

    // Cloudinary private download URLs require the asset to have been
    // uploaded using a compatible private/authenticated delivery type.
    const url = cloudinary.utils.private_download_url(
        storageKey,
        undefined,
        {
            resource_type: getCloudinaryResourceType(mimeType),
            type: "authenticated",
            expires_at: Math.floor(expiresAt.getTime() / 1000),
            attachment: originalFilename,
        },
    );

    return { url, expiresAt };
}

// export async function deleteStoredEvidence({
//     storageProvider,
//     storageKey,
//     mimeType,
// }: {
//     storageProvider: StorageProvider;
//     storageKey: string;
//     mimeType: string;
// }): Promise<void> {
//     if (storageProvider !== StorageProvider.CLOUDINARY) {
//         throw new ServiceError(
//             501,
//             "Evidence deletion is not configured for this storage provider.",
//         );
//     }

//     const result = await cloudinary.uploader.destroy(storageKey, {
//         resource_type: getCloudinaryResourceType(mimeType),
//         type: "authenticated",
//         invalidate: true,
//     });

//     if (result.result !== "ok" && result.result !== "not found") {
//         throw new ServiceError(502, "Unable to delete the stored evidence.");
//     }
// }
