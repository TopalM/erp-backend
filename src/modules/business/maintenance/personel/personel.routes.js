import { Router } from "express";

import { createPersonelController, listPersonelsController, updatePersonelController } from "./personel.controller.js";

const router = Router();

router.get("/all", listPersonelsController);
router.get("/allForAdmin", listPersonelsController);

router.post("/add", createPersonelController);
router.post("/update", updatePersonelController);
router.patch("/:id", updatePersonelController);

export default router;
