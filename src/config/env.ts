import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 300;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL não definida no arquivo .env");
}

export const env = {
    PORT,
    DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET!,
};