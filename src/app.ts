import "reflect-metadata";
import express from "express";

import { corsConfig } from "./config/cors";

import { router } from "./routes";

import { errorHandler } from "./errors/errorHandler";

const app = express();

app.use(corsConfig);

app.use(express.json());

app.use(router);

app.use(errorHandler);

export { app };
