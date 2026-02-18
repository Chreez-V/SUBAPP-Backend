import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import * as z from "zod";

// Try to load .env from project root; if missing, fall back to .example.env
const envPath = path.resolve(process.cwd(), ".env");
const examplePath = path.resolve(process.cwd(), ".example.env");

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else if (fs.existsSync(examplePath)) {
    console.warn(".env not found — loading .example.env as fallback");
    dotenv.config({ path: examplePath });
} else {
    // Last resort: attempt default load (will look for .env in cwd)
    dotenv.config();
}

interface Envs {
    PORT: number;
    MONGODB_URL: string;
    HOST: string;
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    OSRM_URL?: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    SUPABASE_BUCKET: string;
}

const envsSchema = z.object({
    PORT: z.coerce.number().min(1),
    MONGODB_URL: z.url(),
    HOST: z.string().min(1),
    JWT_SECRET: z.string().min(10),
    GOOGLE_CLIENT_ID: z.string().min(1).optional().default(""),
    OSRM_URL: z.string().url().optional(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string().min(1),
    SUPABASE_BUCKET: z.string().min(1),
});

const result = envsSchema.safeParse({ ...process.env });

if (!result.success) {
    const errorsKeys = Object.keys(z.treeifyError(result.error).properties!);

    console.error("❌ Invalid .env or credentials:");

    const formatted = result.error.format() as Record<string, { _errors?: string[] }>;

    errorsKeys.forEach((key) => {
        const message = formatted[key]?._errors?.join(", ") ?? "Unknown error";

        console.error(` - ${key}: ${message}`);
    });

    process.exit(1);
}

const envsValidates: Envs = result.data as Envs;

export const envs = {
    PORT: envsValidates.PORT,
    MONGODB_URL: envsValidates.MONGODB_URL,
    HOST: envsValidates.HOST,
    JWT_SECRET: envsValidates.JWT_SECRET,
    GOOGLE_CLIENT_ID: envsValidates.GOOGLE_CLIENT_ID,
    OSRM_URL: envsValidates.OSRM_URL,
    SUPABASE_URL: envsValidates.SUPABASE_URL,
    SUPABASE_KEY: envsValidates.SUPABASE_KEY,
    SUPABASE_BUCKET: envsValidates.SUPABASE_BUCKET,
};
