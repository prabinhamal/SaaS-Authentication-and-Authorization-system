import express, { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors"
import connectDatabase from "./config/connectDB";
import { errorMiddleware, notFoundHandler } from "./middleware/error.middleware";
import { BadRequestError } from "./utils/AppError";
import config from "./config/config";

import authRouter from "./routes/auth.route"
import cookieParser from "cookie-parser";


const app: Express = express();

const PORT: number = Number(config.get("port")) || 3001;

app.use(bodyParser.json());
app.use(express.json())
app.use(cookieParser())



connectDatabase();
app.use("/api/v1/", authRouter)

/// global error handel
app.use(notFoundHandler);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`server are run or http://localhost:${PORT}`);
});


