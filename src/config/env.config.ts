import "dotenv/config";
import * as z from "zod"

interface Envs {
    PORT: number;
    MONGODB_URL: string;
    HOST: string;
    JWT_SECRET: string;
}

const envsSchema = z.object({
    PORT: z.coerce.number().min(1),
    MONGODB_URL: z.url(),
    HOST: z.string().min(1),
    JWT_SECRET: z.string().min(10),
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
}
