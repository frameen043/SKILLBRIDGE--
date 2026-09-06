
const express = require("express");

const {
  // Admin provider management
  getPendingProviders,
  approveProvider,
  rejectProvider,
  getAllProviders,
  updateProviderStatus,

  // Admin dashboard
  getAdminDashboardStats,

  // Admin customer management
  getAllCustomers,
  updateCustomerStatus,

  // Customer profile
  getMyProfile,
  updateMyProfile,

  // Provider profile
  getMyProviderProfile,
  updateMyProviderProfile,

  // Public professionals
  getPublicProviders,
  getPublicProviderById,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// ======================================================
// PUBLIC PROFESSIONAL ROUTES - FR-13 & FR-14
// ======================================================

// Public: Browse/search approved professionals
router.get(
  "/professionals",
  getPublicProviders
);


// Public: View one approved professional profile
router.get(
  "/professionals/:id",
  getPublicProviderById
);


// ======================================================
// ADMIN DASHBOARD - FR-35
// ======================================================

router.get(
  "/admin/stats",
  protect,
  authorize("admin"),
  getAdminDashboardStats
);


// ======================================================
// ADMIN CUSTOMER MANAGEMENT - FR-36
// ======================================================

router.get(
  "/customers",
  protect,
  authorize("admin"),
  getAllCustomers
);


router.patch(
  "/customers/:id/status",
  protect,
  authorize("admin"),
  updateCustomerStatus
);


// ======================================================
// ADMIN PROVIDER MANAGEMENT - FR-37
// ======================================================

router.get(
  "/providers",
  protect,
  authorize("admin"),
  getAllProviders
);


router.get(
  "/providers/pending",
  protect,
  authorize("admin"),
  getPendingProviders
);


router.patch(
  "/providers/:id/approve",
  protect,
  authorize("admin"),
  approveProvider
);


router.patch(
  "/providers/:id/reject",
  protect,
  authorize("admin"),
  rejectProvider
);


router.patch(
  "/providers/:id/status",
  protect,
  authorize("admin"),
  updateProviderStatus
);


// ======================================================
// CUSTOMER PROFILE - FR-32
// ======================================================

router.get(
  "/profile",
  protect,
  authorize("customer"),
  getMyProfile
);


router.patch(
  "/profile",
  protect,
  authorize("customer"),
  updateMyProfile
);


// ======================================================
// PROVIDER PROFILE - FR-33
// ======================================================

router.get(
  "/provider/profile",
  protect,
  authorize("provider"),
  getMyProviderProfile
);


router.patch(
  "/provider/profile",
  protect,
  authorize("provider"),
  updateMyProviderProfile
);


module.exports = router;

