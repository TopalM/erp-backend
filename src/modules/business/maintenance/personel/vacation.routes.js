import { Router } from "express";

const router = Router();

function emptyList(req, res) {
  res.json({
    success: true,
    data: [],
  });
}

router.get("/allVacation", emptyList);
router.get("/allVacationForAdmin", emptyList);

router.get("/allOtherVacation", emptyList);
router.get("/allOtherVacationForAdmin", emptyList);

router.get("/allOverTime", emptyList);
router.get("/allOverTimeForAdmin", emptyList);

export default router;
