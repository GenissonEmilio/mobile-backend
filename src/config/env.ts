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
    EXTERNAL_PRODUCTS_PROVIDER:
        process.env.EXTERNAL_PRODUCTS_PROVIDER ?? "mercadolivre",
    MERCADO_LIVRE_API_BASE_URL:
        process.env.MERCADO_LIVRE_API_BASE_URL ?? "https://api.mercadolibre.com",
    MERCADO_LIVRE_SITE_ID: process.env.MERCADO_LIVRE_SITE_ID ?? "MLB",
};
