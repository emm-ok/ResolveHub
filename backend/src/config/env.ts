import dotenv from 'dotenv';

dotenv.config();

export const env = {
    NODE_ENV: process.env.NODE_ENV! || 'development',
    PORT: process.env.PORT! || 3000,
    // DATABASE_URL: process.env.DATABASE_URL!
}

Object.keys(env).forEach((key) => {
    const envKey = key as keyof typeof env;
    if (!env[envKey]) {
        throw new Error(`Missing environment variable: ${key}`);
    }
});

