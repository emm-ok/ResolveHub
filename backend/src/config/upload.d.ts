interface CloudinaryUploadOptions {
    folder: string;
    resourceType?: "image" | "video" | "raw" | "auto";
    publicId?: string;
}
export declare const uploadToCloudinary: (buffer: Buffer, options: CloudinaryUploadOptions) => Promise<unknown>;
export {};
//# sourceMappingURL=upload.d.ts.map