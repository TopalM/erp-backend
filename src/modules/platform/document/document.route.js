import express from "express";

import * as controller from "./document.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { uploadTempFiles } from "../../../middlewares/uploadTempFiles.middleware.js";

import { createDocumentSchema } from "./document.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", controller.listDocuments);

router.get("/:id", controller.getDocumentById);

router.get("/:id/download-url", controller.getDocumentDownloadUrl);

router.post("/", uploadTempFiles.single("file"), validate(createDocumentSchema), controller.uploadDocument);

router.delete("/:id", controller.deleteDocument);

export default router;
