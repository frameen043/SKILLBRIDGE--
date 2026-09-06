const mongoose = require("mongoose");
const Review = require("../models/Review");
const Request = require("../models/Request");
const Notification = require("../models/Notification");

// Create a review for a completed request
const createReview = async (req, res) => {
try {
const { requestId, rating, comment } = req.body;


// Validate requestId
if (!requestId) {
  return res.status(400).json({
    message: "Request ID is required.",
  });
}

if (!mongoose.Types.ObjectId.isValid(requestId)) {
  return res.status(400).json({
    message: "Invalid request ID.",
  });
}

// Validate rating
if (rating === undefined || rating === null || rating === "") {
  return res.status(400).json({
    message: "Rating is required.",
  });
}

if (typeof rating !== "number" || Number.isNaN(rating)) {
  return res.status(400).json({
    message: "Rating must be a number.",
  });
}

if (rating < 1 || rating > 5) {
  return res.status(400).json({
    message: "Rating must be between 1 and 5.",
  });
}

// Validate comment
if (
  comment !== undefined &&
  comment !== null &&
  typeof comment !== "string"
) {
  return res.status(400).json({
    message: "Comment must be a string.",
  });
}

// Get authenticated customer from JWT
const customerId = req.user._id || req.user.id;

// Find request
const request = await Request.findById(requestId);

if (!request) {
  return res.status(404).json({
    message: "Request not found.",
  });
}

// Verify request belongs to authenticated customer
if (request.customerId.toString() !== customerId.toString()) {
  return res.status(403).json({
    message: "Forbidden. This request does not belong to you.",
  });
}

// Only completed requests can be reviewed
if (request.status !== "completed") {
  return res.status(400).json({
    message:
      "You can only review a request after it has been completed.",
  });
}

// Check whether this request already has a review
const existingReview = await Review.findOne({
  requestId: request._id,
});

if (existingReview) {
  return res.status(409).json({
    message: "A review already exists for this request.",
  });
}

// Create review using trusted database relationships
const review = await Review.create({
  customerId,
  serviceId: request.serviceId,
  providerId: request.providerId,
  requestId: request._id,
  rating,
  comment: comment || "",
});

// Notify the provider about the new review
await Notification.create({
  recipientId: request.providerId,
  type: "new_review",
  message: `You received a new ${rating}-star review.`,
});

return res.status(201).json({
  message: "Review created successfully.",
  review,
});


} catch (error) {
console.error("Error creating review:", error);


// Protect against duplicate creation race conditions
if (error.code === 11000) {
  return res.status(409).json({
    message: "A review already exists for this request.",
  });
}

if (error.name === "ValidationError") {
  return res.status(400).json({
    message: "Validation error.",
    errors: Object.values(error.errors).map(
      (err) => err.message
    ),
  });
}

return res.status(500).json({
  message: "Server error while creating review.",
});


}
};

// Get reviews and rating summary for a service
const getServiceReviews = async (req, res) => {
try {
const { serviceId } = req.params;


if (!mongoose.Types.ObjectId.isValid(serviceId)) {
  return res.status(400).json({
    message: "Invalid service ID.",
  });
}

const reviews = await Review.find({
  serviceId,
})
  .populate("customerId", "name")
  .sort({ createdAt: -1 });

const ratingSummary = await Review.aggregate([
  {
    $match: {
      serviceId: new mongoose.Types.ObjectId(serviceId),
    },
  },
  {
    $group: {
      _id: null,
      totalReviews: {
        $sum: 1,
      },
      averageRating: {
        $avg: "$rating",
      },
    },
  },
]);

const summary =
  ratingSummary.length > 0
    ? ratingSummary[0]
    : {
        totalReviews: 0,
        averageRating: 0,
      };

return res.status(200).json({
  reviews,
  totalReviews: summary.totalReviews,
  averageRating: summary.averageRating,
});


} catch (error) {
console.error("Error fetching service reviews:", error);


return res.status(500).json({
  message: "Server error while fetching service reviews.",
});


}
};

module.exports = {
createReview,
getServiceReviews,
};
