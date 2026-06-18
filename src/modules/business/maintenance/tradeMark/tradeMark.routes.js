import { Router } from "express";
import { createTradeMarkController, deleteTradeMarkController, listTradeMarksController, updateTradeMarkController } from "./tradeMark.controller.js";

const router = Router();

router.get("/all", listTradeMarksController);
router.post("/add", createTradeMarkController);
router.post("/update", updateTradeMarkController);
router.delete("/delete/:id", deleteTradeMarkController);

export default router;
