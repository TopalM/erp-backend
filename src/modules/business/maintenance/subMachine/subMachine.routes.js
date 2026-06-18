import { Router } from "express";
import { createSubMachineController, listSubMachinesController, updateSubMachineController } from "./subMachine.controller.js";

const router = Router();

router.get("/all", listSubMachinesController);
router.post("/add", createSubMachineController);
router.post("/update", updateSubMachineController);

export default router;
