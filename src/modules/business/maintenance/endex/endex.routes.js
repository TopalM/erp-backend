import { Router } from "express";

import { createEndexController, deleteEndexController, listEndexController, updateEndexController } from "./endex.controller.js";

const router = Router();

router.get("/getAll", listEndexController);
router.get("/all", listEndexController);

router.post("/add", createEndexController);
router.post("/update", updateEndexController);
router.patch("/:id", updateEndexController);

router.post("/delete", deleteEndexController);
router.delete("/delete/:id", deleteEndexController);

export default router;
