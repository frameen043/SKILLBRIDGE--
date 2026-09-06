const mongoose = require("mongoose");
const Service = require("../models/Service");

// Create a new service
const createService = async (req, res) => {
  try {
    const { title, description, category, price, imageUrl } = req.body;

    const providerId = req.user._id || req.user.id;

    const service = await Service.create({
      title,
      description,
      category,
      price,
      imageUrl,
      providerId,
    });

    return res.status(201).json({
      message: "Service created successfully.",
      service,
    });
  } catch (error) {
    console.error("Error creating service:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Server error while creating service.",
    });
  }
};

// Get services created by the authenticated provider
const getMyServices = async (req, res) => {
  try {
    const providerId = req.user._id || req.user.id;

    const services = await Service.find({
      providerId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);

    return res.status(500).json({
      message: "Server error while fetching services.",
    });
  }
};

// Update a provider's own service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid service ID.",
      });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found.",
      });
    }

    const providerId = req.user._id || req.user.id;

    if (service.providerId.toString() !== providerId.toString()) {
      return res.status(403).json({
        message: "Forbidden. You do not own this service.",
      });
    }

    const { title, description, category, price, imageUrl } = req.body;

    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;
    if (price !== undefined) service.price = price;
    if (imageUrl !== undefined) service.imageUrl = imageUrl;

    const updatedService = await service.save();

    return res.status(200).json({
      message: "Service updated successfully.",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Server error while updating service.",
    });
  }
};

// Delete a provider's own service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid service ID.",
      });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found.",
      });
    }

    const providerId = req.user._id || req.user.id;

    if (service.providerId.toString() !== providerId.toString()) {
      return res.status(403).json({
        message: "Forbidden. You do not own this service.",
      });
    }

    await service.deleteOne();

    return res.status(200).json({
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting service:", error);

    return res.status(500).json({
      message: "Server error while deleting service.",
    });
  }
};

// Get all public services
const getAllServices = async (req, res) => {
  try {
    const {
      category,
      search,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Search by title or description
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Pagination values
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);

    const skip = (pageNumber - 1) * limitNumber;

    // Allowed sorting fields
    const allowedSortFields = [
      "createdAt",
      "price",
      "title",
      "category",
    ];

    const validSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortOrder = order === "asc" ? 1 : -1;

    const sortOptions = {
      [validSortBy]: sortOrder,
    };

    // Get total services
    const totalServices = await Service.countDocuments(filter);

    // Get services
    const services = await Service.find(filter)
      .populate("providerId", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      services,

      pagination: {
        totalServices,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalServices / limitNumber),
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching all services:", error);

    return res.status(500).json({
      message: "Server error while fetching services.",
    });
  }
};

// Get a single public service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate service ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid service ID.",
      });
    }

    // Find service and safely populate provider information
    const service = await Service.findById(id).populate(
      "providerId",
      "name email"
    );

    // Service does not exist
    if (!service) {
      return res.status(404).json({
        message: "Service not found.",
      });
    }

    return res.status(200).json({
      service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);

    return res.status(500).json({
      message: "Server error while fetching service.",
    });
  }
};

// Admin: Get all/search services
const getAdminServices = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};

    // Search by service title or description
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    const services = await Service.find(filter)
      .populate("providerId", "name email status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      services,
    });
  } catch (error) {
    console.error("Error fetching admin services:", error);

    return res.status(500).json({
      message: "Server error while fetching services.",
    });
  }
};

// Admin: Delete any service
const adminDeleteService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid service ID.",
      });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found.",
      });
    }

    await service.deleteOne();

    return res.status(200).json({
      message: "Service deleted successfully by admin.",
    });
  } catch (error) {
    console.error("Error deleting service as admin:", error);

    return res.status(500).json({
      message: "Server error while deleting service.",
    });
  }
};

module.exports = {
  createService,
  getMyServices,
  updateService,
  deleteService,
  getAllServices,
  getServiceById,
  getAdminServices,
  adminDeleteService,
};