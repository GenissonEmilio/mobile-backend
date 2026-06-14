import cors from "cors";

export const corsConfig = cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
});