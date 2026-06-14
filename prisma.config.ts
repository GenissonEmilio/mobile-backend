// prisma.config.ts
import "dotenv/config";

declare const process: {
  env: {
    DATABASE_URL?: string;
  };
};

// Em vez de importar um módulo inexistente, definimos o objeto diretamente
const config = {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
};

export default config;