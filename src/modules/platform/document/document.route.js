import express from "express";

import * as controller from "./document.controller.js";

import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { authorizePermissions } from "../../../middlewares/authorizePermissions.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { uploadTempFiles } from "../../../middlewares/uploadTempFiles.middleware.js";

import { PERMISSIONS } from "../../../constants/permissions.js";

import { createDocumentSchema } from "./document.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", authorizePermissions(PERMISSIONS.DOCUMENT_READ), controller.listDocuments);

router.get("/:id/download-url", authorizePermissions(PERMISSIONS.DOCUMENT_DOWNLOAD), controller.getDocumentDownloadUrl);

router.get("/:id", authorizePermissions(PERMISSIONS.DOCUMENT_READ), controller.getDocumentById);

router.post(
  "/",
  authorizePermissions(PERMISSIONS.DOCUMENT_CREATE),
  uploadTempFiles.single("file"),
  validate(createDocumentSchema),
  controller.uploadDocument,
);

router.delete("/:id", authorizePermissions(PERMISSIONS.DOCUMENT_DELETE), controller.deleteDocument);

export default router;
