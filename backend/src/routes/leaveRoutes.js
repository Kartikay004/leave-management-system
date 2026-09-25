const express = require("express");

const {
    applyLeave,
    getMyLeaves,
    getPendingLeaves,
    getAllLeaves,
    updateLeaveStatus,
    getEmployees
} = require("../controllers/leaveController");

const protect = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const router = express.Router();

// Employee routes
router.post("/", protect, applyLeave);
router.get("/my", protect, getMyLeaves);

// Manager routes
router.get(
    "/pending",
    protect,
    authorizeRole("manager"),
    getPendingLeaves
);

router.get(
    "/all",
    protect,
    authorizeRole("manager"),
    getAllLeaves
);

router.put(
    "/:id/status",
    protect,
    authorizeRole("manager"),
    updateLeaveStatus
);

router.get(
    "/employees",
    protect,
    authorizeRole("manager"),
    getEmployees
);

module.exports = router;