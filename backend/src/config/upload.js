import cloudinary from "./cloudinary.js";
export const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: options.folder,
            resource_type: options.resourceType ?? "auto",
            ...(options.publicId !== undefined && { public_id: options.publicId }),
        }, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
        stream.end(buffer);
    });
};
//# sourceMappingURL=upload.js.map