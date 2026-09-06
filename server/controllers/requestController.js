const mongoose = require("mongoose");

const Request = require("../models/Request");
const Service = require("../models/Service");
const Notification = require("../models/Notification");

// =====================================================
// Customer: Create a service request
// =====================================================
const createRequest = async (req, res) => {
  try {
    const { serviceId, message } = req.body;

    if (!serviceId || !message || !message.trim()) {
      return res.status(400).json({
        message: "Service ID and message are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        message: "Invalid service ID.",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        message: "Service not found.",
      });
    }

    const customerId = req.user._id || req.user.id;

    // Prevent duplicate pending request for the same service
    const existingRequest = await Request.findOne({
      customerId,
      serviceId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request for this service.",
      });
    }

    const request = await Request.create({
      customerId,
      providerId: service.providerId,
      serviceId,
      message: message.trim(),
      status: "pending",
    });

    // Create notification for the provider
    await Notification.create({
      recipientId: service.providerId,
      type: "new_request",
      message: `You received a new request for "${service.title}".`,
      relatedId: request._id,
      relatedModel: "Request",
    });

    const populatedRequest = await Request.findById(request._id)
      .populate("customerId", "name email")
      .populate("providerId", "name email")
      .populate(
        "serviceId",
        "title description category price imageUrl"
      );

    return res.status(201).json({
      message: "Service request created successfully.",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("Error creating request:", error);

    return res.status(500).json({
      message: "Server error while creating request.",
    });
  }
};


// =====================================================
// Provider: Get incoming requests
// =====================================================
const getIncomingRequests = async (req, res) => {
  try {
    const providerId = req.user._id || req.user.id;

    const requests = await Request.find({ providerId })
      .populate("customerId", "name email")
      .populate(
        "serviceId",
        "title description category price imageUrl"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error("Error fetching incoming requests:", error);

    return res.status(500).json({
      message: "Server error while fetching incoming requests.",
    });
  }
};


// =====================================================
// Provider: Update request status
// =====================================================
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "accepted",
      "rejected",
      "in_progress",
      "completed",
    ];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid request ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid request status.",
      });
    }

    const providerId = req.user._id || req.user.id;

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found.",
      });
    }

    // Provider can only update their own incoming requests
    if (request.providerId.toString() !== providerId.toString()) {
      return res.status(403).json({
        message: "Forbidden. This request does not belong to you.",
      });
    }

    // Prevent invalid status transitions
    if (request.status === "rejected" || request.status === "completed") {
      return res.status(400).json({
        message: `This request is already ${request.status}.`,
      });
    }

    if (
      request.status === "accepted" &&
      status === "accepted"
    ) {
      return res.status(400).json({
        message: "Request is already accepted.",
      });
    }

    if (
      request.status === "in_progress" &&
      status === "accepted"
    ) {
      return res.status(400).json({
        message:
          "An in-progress request cannot be changed back to accepted.",
      });
    }

    request.status = status;

    await request.save();

    // Create notification for the customer
    const notificationMessages = {
      accepted: "Your service request has been accepted.",
      rejected: "Your service request has been rejected.",
      in_progress: "Your service request is now in progress.",
      completed: "Your service request has been completed.",
    };

    await Notification.create({
      recipientId: request.customerId,
      type:
        status === "accepted"
          ? "request accepted"
          : status === "rejected"
          ? "request rejected"
          : status === "in_progress"
          ? "request in progress"
          : "request completed",
      message: notificationMessages[status],
      relatedId: request._id,
      relatedModel: "Request",
    });

    const updatedRequest = await Request.findById(request._id)
      .populate("customerId", "name email")
      .populate("providerId", "name email")
      .populate(
        "serviceId",
        "title description category price imageUrl"
      );

    return res.status(200).json({
      message: "Request status updated successfully.",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating request status:", error);

    return res.status(500).json({
      message: "Server error while updating request status.",
    });
  }
};


// =====================================================
// Customer: Get all my requests
// =====================================================
const getMyRequests = async (req, res) => {
  try {
    const customerId = req.user._id || req.user.id;

    const requests = await Request.find({ customerId })
      .populate("providerId", "name email")
      .populate(
        "serviceId",
        "title description category price imageUrl"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error("Error fetching customer requests:", error);

    return res.status(500).json({
      message: "Server error while fetching your requests.",
    });
  }
};


// =====================================================
// Customer: Get one of my requests by ID
// =====================================================
const getMyRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid request ID.",
      });
    }

    const customerId = req.user._id || req.user.id;

    const request = await Request.findById(id)
      .populate("providerId", "name email")
      .populate(
        "serviceId",
        "title description category price imageUrl"
      );

    if (!request) {
      return res.status(404).json({
        message: "Request not found.",
      });
    }

    if (request.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({
        message: "Forbidden. This request does not belong to you.",
      });
    }

    return res.status(200).json({
      request,
    });
  } catch (error) {
    console.error("Error fetching request:", error);

    return res.status(500).json({
      message: "Server error while fetching request.",
    });
  }
};


// =====================================================
// Admin: Monitor all service requests
// =====================================================
const getAllRequestsForAdmin = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("customerId", "name email")
      .populate("providerId", "name email")
      .populate(
        "serviceId",
        "title description category price imageUrl"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error("Error fetching admin requests:", error);

    return res.status(500).json({
      message: "Server error while fetching service requests.",
    });
  }
};


// =====================================================
// Exports
// =====================================================
module.exports = {
  createRequest,
  getIncomingRequests,
  updateRequestStatus,
  getMyRequests,
  getMyRequestById,
  getAllRequestsForAdmin,
};