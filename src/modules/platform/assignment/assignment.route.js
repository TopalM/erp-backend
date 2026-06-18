import express from "express";

import * as controller from "./assignment.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { createAssignmentSchema, updateAssignmentSchema } from "./assignment.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", controller.listAssignments);
router.post("/", validate(createAssignmentSchema), controller.createAssignment);
router.patch("/:id", validate(updateAssignmentSchema), controller.updateAssignment);
router.delete("/:id", controller.deleteAssignment);

export default router;
