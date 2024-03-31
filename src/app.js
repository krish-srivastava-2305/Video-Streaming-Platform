import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use(express.json({ limit: "16kb" })); // specifies limit of json coming from form
app.use(urlencoded()); // specifies limit of data coming from url
app.use(express.static()); // sets public folder
app.use(cookieParser()); // cookieparser

export { app };
