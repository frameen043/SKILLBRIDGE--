const express = require("express");

const {
  createService,
  getMyServices,
  updateService,
  deleteService,
  getAllServices,
  getServiceById,
  getAdminServices,
  adminDeleteService,
} = require("../controllers/serviceController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const checkProviderApproval = require("../middleware/approvalMiddleware");

const router = express.Router();

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Browse services
// Supports search, category filter, sorting and pagination
router.get("/", getAllServices);

// ======================================================
// ADMIN ROUTES
// IMPORTANT: These routes must come before "/:id"
// ======================================================

// Admin: View/search all services
router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAdminServices
);

// Admin: Delete any service
router.delete(
  "/admin/:id",
  protect,
  authorize("admin"),
  adminDeleteService
);

// ======================================================
// PROVIDER ROUTES
// ======================================================

// Provider: Get own services
router.get(
  "/my-services",
  protect,
  authorize("provider"),
  checkProviderApproval,
  getMyServices
);

// Provider: Create service
router.post(
  "/",
  protect,
  authorize("provider"),
  checkProviderApproval,
  createService
);

// Provider: Update own service
router.patch(
  "/:id",
  protect,
  authorize("provider"),
  checkProviderApproval,
  updateService
);

// Provider: Delete own service
router.delete(
  "/:id",
  protect,
  authorize("provider"),
  checkProviderApproval,
  deleteService
);

// ======================================================
// PUBLIC SERVICE DETAILS
// IMPORTANT: Keep this route after named routes
// ======================================================

// Public: Get one service by ID
router.get("/:id", getServiceById);

module.exports = router;