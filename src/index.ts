import express, { Express, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors"
import connectDatabase from "./config/connectDB";
import { errorMiddleware, notFoundHandler } from "./middleware/error.middleware";
import { BadRequestError } from "./utils/AppError";
import config from "./config/config";


const app: Express = express();

const PORT: number = Number(config.get("port")) || 3001;

app.use(bodyParser.json());
app.use(express.json())



connectDatabase();
app.get("/", (req: Request, res: Response, next): void => {
    next( new BadRequestError("Request is bad this is "));
});


/// global error handel
app.use(notFoundHandler);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`server are run or http://localhost:${PORT}`);
});


