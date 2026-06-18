import express from "express";

import * as controller from "./reading.controller.js";
import { authMiddleware } from "../../../../middlewares/auth.middleware.js";
import { validate } from "../../../../middlewares/validate.middleware.js";
import { createReadingSchema, updateReadingSchema } from "./reading.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", controller.listReadings);
router.post("/", validate(createReadingSchema), controller.createReading);
router.patch("/:id", validate(updateReadingSchema), controller.updateReading);
router.delete("/:id", controller.deleteReading);

export default router;
