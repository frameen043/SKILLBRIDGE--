const express = require("express");

const {
  createReview,
  getServiceReviews,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Public: Get reviews for a service
router.get(
  "/service/:serviceId",
  getServiceReviews
);

// Customer-only: Create a review
router.post(
  "/",
  protect,
  authorize("customer"),
  createReview
);

module.exports = router;