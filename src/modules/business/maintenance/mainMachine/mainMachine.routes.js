import { Router } from "express";
import { createMainMachineController, listMainMachinesController, updateMainMachineController } from "./mainMachine.controller.js";

const router = Router();

router.get("/all", listMainMachinesController);
router.post("/add", createMainMachineController);
router.post("/update", updateMainMachineController);

export default router;
