import { Router } from "express";
import { MedicationController } from "../controllers/medication.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const medicationRouter = Router();
const medicationController = new MedicationController();

/** All medication routes require a valid JWT and are scoped to the caller. */
medicationRouter.use(authorizedMiddleware);

medicationRouter.get("/today", medicationController.listDueToday);
medicationRouter.get("/", medicationController.list);
medicationRouter.get("/:id", medicationController.getById);
medicationRouter.post("/", medicationController.create);
medicationRouter.put("/:id", medicationController.update);
medicationRouter.delete("/:id", medicationController.delete);
medicationRouter.patch("/:id/taken", medicationController.markTaken);

export default medicationRouter;
