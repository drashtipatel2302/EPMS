const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { recommendPromotion, getTeamPromotions, getAllPromotions, reviewPromotion, notifyEmployee } = require("../controllers/promotionController");

router.use(protect);
router.post("/recommend", authorizeRoles("MANAGER"), recommendPromotion);
router.get("/team", authorizeRoles("MANAGER"), getTeamPromotions);
router.get("/all", authorizeRoles("SUPER_ADMIN", "HR"), getAllPromotions);
router.put("/:id/review", authorizeRoles("SUPER_ADMIN", "HR"), reviewPromotion);
router.post("/:id/notify", authorizeRoles("MANAGER"), notifyEmployee);

module.exports = router;
