import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const adminRouter = Router();
const adminController = new AdminController();

/** All admin routes require a valid JWT and admin role. */
adminRouter.use(authorizedMiddleware, adminMiddleware);

adminRouter.get("/users", adminController.listUsers);
adminRouter.get("/users/:id", adminController.getUserById);
adminRouter.post("/users", adminController.createUser);
adminRouter.put("/users/:id", adminController.updateUser);
adminRouter.delete("/users/:id", adminController.deleteUser);

export default adminRouter;
