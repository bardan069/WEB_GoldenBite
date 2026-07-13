import { Router } from "express";
import { ExerciseController } from "../controllers/exercise.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const exerciseRouter = Router();
const exerciseController = new ExerciseController();

/** All exercise routes require a valid JWT and are scoped to the caller. */
exerciseRouter.use(authorizedMiddleware);

exerciseRouter.get("/today", exerciseController.listDueToday);
exerciseRouter.get("/", exerciseController.list);
exerciseRouter.get("/:id", exerciseController.getById);
exerciseRouter.post("/", exerciseController.create);
exerciseRouter.put("/:id", exerciseController.update);
exerciseRouter.delete("/:id", exerciseController.delete);
exerciseRouter.patch("/:id/complete", exerciseController.markComplete);

export default exerciseRouter;
