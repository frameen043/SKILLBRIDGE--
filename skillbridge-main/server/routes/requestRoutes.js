
const express = require("express");

const {
  createRequest,
  getIncomingRequests,
  updateRequestStatus,
  getMyRequests,
  getMyRequestById,
  getAllRequestsForAdmin,
} = require("../controllers/requestController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Customer: Get one of my requests by ID
router.get(
  "/my-requests/:id",
  protect,
  authorize("customer"),
  getMyRequestById
);

// Admin: Monitor all service requests
router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAllRequestsForAdmin
);

// Customer: Create a service request
router.post(
  "/",
  protect,
  authorize("customer"),
  createRequest
);

// Provider: Get incoming requests
router.get(
  "/incoming",
  protect,
  authorize("provider"),
  getIncomingRequests
);

// Customer: Get my requests
router.get(
  "/my-requests",
  protect,
  authorize("customer"),
  getMyRequests
);

// Provider: Update request status
router.patch(
  "/:id/status",
  protect,
  authorize("provider"),
  updateRequestStatus
);

module.exports = router;

