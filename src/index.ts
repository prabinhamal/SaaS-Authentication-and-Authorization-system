import express, { Express } from "express";
import bodyParser from "body-parser";
import connectDatabase from "./config/connectDB";
import { errorMiddleware, notFoundHandler } from "./middleware/error.middleware";
import config from "./config/config";

import authRouter from "./routes/auth.route"
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route"
import mfaRouter from "./routes/mfa.route"
import { connectRedis } from "./config/redis.config";
import corsMiddleware from "./middleware/cors";
import mfaRecoveryRouter from "./routes/mfaRecovery.route"
import rolesRouter from "./routes/role.route"
import roleAssignmentRouter from "./routes/roleAssignment.route"

const app: Express = express();

const PORT: number = Number(config.get("port")) || 3001;

app.use(corsMiddleware);

app.use(bodyParser.json());
app.use(express.json())
app.use(cookieParser())


connectDatabase();
connectRedis();
app.use("/api/v1/", authRouter)
app.use("/api/v1/", userRouter)
app.use("/api/v1/", mfaRouter)
app.use("/api/v1/mfa/recovery/", mfaRecoveryRouter)
app.use("/api/v1/roles/", rolesRouter)
app.use("/api/v1/role-assignments", roleAssignmentRouter);

/// global error handel
app.use(notFoundHandler);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`server are run or http://localhost:${PORT}`);
});