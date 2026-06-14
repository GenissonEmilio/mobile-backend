import express from "express";

import { corsConfig } from "./config/cors";

const app = express();

app.use(corsConfig);

app.use(express.json());

export { app };