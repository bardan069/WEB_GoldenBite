import { Router } from "express";
import { DietController } from "../controllers/diet.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const dietRouter = Router();
const dietController = new DietController();

/** All diet routes require a valid JWT and are scoped to the caller. */
dietRouter.use(authorizedMiddleware);

dietRouter.get("/recommendation", dietController.getRecommendation);
dietRouter.get("/entries", dietController.listEntries);
dietRouter.get("/entries/:id", dietController.getEntryById);
dietRouter.post("/entries", dietController.createEntry);
dietRouter.put("/entries/:id", dietController.updateEntry);
dietRouter.delete("/entries/:id", dietController.deleteEntry);
dietRouter.post("/analyze-photo", uploads.single("photo"), dietController.analyzePhoto);

export default dietRouter;
