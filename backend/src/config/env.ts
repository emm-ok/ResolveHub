import dotenv from 'dotenv';
dotenv.config();

export const env = {
    PORT: process.env.PORT! || 5000,
    NODE_ENV: process.env.NODE_ENV! || 'development',

    DATABASE_URL: process.env.DATABASE_URL!,

    CUSTOMER_URL: process.env.CUSTOMER_URL!,
    ADMIN_URL: process.env.ADMIN_URL!,

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,

    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY!,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
    CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET!,
}

Object.entries(env).forEach(([key, value]) => {
    if (!value) {
        console.log("Missing environment variable", key)
    }
})



