import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import userRouter from "./routes/user.route";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1/auth", userRouter);

app.use((req, res) => {
    return ApiResponseHelper.error(res, "Route not found", 404);
});

app.use((err: Error | HttpException, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof HttpException) {
        return ApiResponseHelper.error(res, err.message, err.status);
    }
    return ApiResponseHelper.error(res, err.message || "Internal Server Error", 500);
});

export default app;
