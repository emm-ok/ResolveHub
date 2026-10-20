
import { randomUUID } from "node:crypto";
import cloudinary from "../config/cloudinary.js";

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
