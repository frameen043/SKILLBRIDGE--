const mongoose = require("mongoose");

const User = require("../models/User");
const Service = require("../models/Service");
const Request = require("../models/Request");
const Review = require("../models/Review");

// ======================================================
// ADMIN DASHBOARD
// ======================================================

// Get platform-wide dashboard statistics
const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      totalServices,
      totalRequests,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "provider" }),
      Service.countDocuments(),
      Request.countDocuments(),
    ]);

    return res.status(200).json({
      totalUsers,
      totalCustomers,
      totalProviders,
      totalServices,
      totalRequests,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard statistics:", error);

    return res.status(500).json({
      message: "Server error while fetching dashboard statistics.",
    });
  }
};

// ======================================================
// ADMIN CUSTOMER MANAGEMENT
// ======================================================

// Get all customers with optional search
const getAllCustomers = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {
      role: "customer",
    };

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const customers = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);

    return res.status(500).json({
      message: "Server error while fetching customers.",
    });
  }
};

// Update customer status
const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID.",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Status is required.",
      });
    }

    const allowedStatuses = [
      "approved",
      "deactivated",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message:
          'Customer status must be either "approved" or "deactivated".',
      });
    }

    const customer = await User.findById(id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    if (customer.role !== "customer") {
      return res.status(400).json({
        message: "The selected user is not a customer.",
      });
    }

    customer.status = status;

    await customer.save();

    const safeCustomer = customer.toObject();

    delete safeCustomer.password;

    return res.status(200).json({
      message: `Customer status updated to "${status}" successfully.`,
      customer: safeCustomer,
    });
  } catch (error) {
    console.error("Error updating customer status:", error);

    return res.status(500).json({
      message: "Server error while updating customer status.",
    });
  }
};

// ======================================================
// ADMIN PROVIDER MANAGEMENT
// ======================================================

// Get all providers with optional search
const getAllProviders = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {
      role: "provider",
    };

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const providers = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      providers,
    });
  } catch (error) {
    console.error("Error fetching providers:", error);

    return res.status(500).json({
      message: "Server error while fetching providers.",
    });
  }
};

// Get all pending providers
const getPendingProviders = async (req, res) => {
  try {
    const providers = await User.find({
      role: "provider",
      status: "pending",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      providers,
    });
  } catch (error) {
    console.error("Error fetching pending providers:", error);

    return res.status(500).json({
      message: "Server error while fetching pending providers.",
    });
  }
};

// Approve provider
const approveProvider = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid provider ID.",
      });
    }

    const provider = await User.findById(id);

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found.",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        message: "The selected user is not a provider.",
      });
    }

    if (provider.status !== "pending") {
      return res.status(400).json({
        message: "Only pending providers can be approved.",
      });
    }

    provider.status = "approved";

    await provider.save();

    const safeProvider = provider.toObject();

    delete safeProvider.password;

    return res.status(200).json({
      message: "Provider approved successfully.",
      provider: safeProvider,
    });
  } catch (error) {
    console.error("Error approving provider:", error);

    return res.status(500).json({
      message: "Server error while approving provider.",
    });
  }
};

// Reject provider
const rejectProvider = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid provider ID.",
      });
    }

    const provider = await User.findById(id);

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found.",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        message: "The selected user is not a provider.",
      });
    }

    if (provider.status !== "pending") {
      return res.status(400).json({
        message: "Only pending providers can be rejected.",
      });
    }

    provider.status = "rejected";

    await provider.save();

    const safeProvider = provider.toObject();

    delete safeProvider.password;

    return res.status(200).json({
      message: "Provider rejected successfully.",
      provider: safeProvider,
    });
  } catch (error) {
    console.error("Error rejecting provider:", error);

    return res.status(500).json({
      message: "Server error while rejecting provider.",
    });
  }
};

// Update provider status
const updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid provider ID.",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Status is required.",
      });
    }

    const provider = await User.findById(id);

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found.",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        message: "The selected user is not a provider.",
      });
    }

    if (provider.status === "pending") {
      if (
        status !== "approved" &&
        status !== "rejected"
      ) {
        return res.status(400).json({
          message:
            'A pending provider can only be changed to "approved" or "rejected".',
        });
      }
    } else if (provider.status === "approved") {
      if (status !== "deactivated") {
        return res.status(400).json({
          message:
            'An approved provider can only be changed to "deactivated".',
        });
      }
    } else {
      return res.status(400).json({
        message: `Provider status "${provider.status}" cannot be changed.`,
      });
    }

    provider.status = status;

    await provider.save();

    const safeProvider = provider.toObject();

    delete safeProvider.password;

    return res.status(200).json({
      message: `Provider status updated to "${status}" successfully.`,
      provider: safeProvider,
    });
  } catch (error) {
    console.error("Error updating provider status:", error);

    return res.status(500).json({
      message: "Server error while updating provider status.",
    });
  }
};

// ======================================================
// CUSTOMER PROFILE - FR-32
// ======================================================

// Get authenticated customer's own profile
const getMyProfile = async (req, res) => {
  try {
    const customerId = req.user._id || req.user.id;

    const customer = await User.findById(customerId)
      .select("-password");

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    if (customer.role !== "customer") {
      return res.status(403).json({
        message: "Forbidden. This endpoint is for customers only.",
      });
    }

    return res.status(200).json({
      user: customer,
    });
  } catch (error) {
    console.error("Error fetching customer profile:", error);

    return res.status(500).json({
      message: "Server error while fetching customer profile.",
    });
  }
};

// Update authenticated customer's own profile
const updateMyProfile = async (req, res) => {
  try {
    const customerId = req.user._id || req.user.id;
    const { name, email } = req.body;

    const customer = await User.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    if (customer.role !== "customer") {
      return res.status(403).json({
        message: "Forbidden. This endpoint is for customers only.",
      });
    }

    if (
      name === undefined &&
      email === undefined
    ) {
      return res.status(400).json({
        message:
          "Please provide at least one field to update.",
      });
    }

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim() === ""
      ) {
        return res.status(400).json({
          message: "Name must be a non-empty string.",
        });
      }

      customer.name = name.trim();
    }

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        email.trim() === ""
      ) {
        return res.status(400).json({
          message: "Email must be a non-empty string.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: customerId },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email is already registered.",
        });
      }

      customer.email = normalizedEmail;
    }

    await customer.save();

    const safeCustomer = customer.toObject();

    delete safeCustomer.password;

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: safeCustomer,
    });
  } catch (error) {
    console.error(
      "Error updating customer profile:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        errors: Object.values(
          error.errors
        ).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message:
        "Server error while updating customer profile.",
    });
  }
};

// ======================================================
// PROVIDER PROFILE - FR-33
// ======================================================

// Get authenticated provider's own profile
const getMyProviderProfile = async (req, res) => {
  try {
    const providerId = req.user._id || req.user.id;

    const provider = await User.findById(providerId)
      .select("-password");

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found.",
      });
    }

    if (provider.role !== "provider") {
      return res.status(403).json({
        message:
          "Forbidden. This endpoint is for providers only.",
      });
    }

    return res.status(200).json({
      user: provider,
    });
  } catch (error) {
    console.error(
      "Error fetching provider profile:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching provider profile.",
    });
  }
};

// Update authenticated provider's own profile
const updateMyProviderProfile = async (
  req,
  res
) => {
  try {
    const providerId = req.user._id || req.user.id;
    const { name, email } = req.body;

    const provider = await User.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found.",
      });
    }

    if (provider.role !== "provider") {
      return res.status(403).json({
        message:
          "Forbidden. This endpoint is for providers only.",
      });
    }

    if (
      name === undefined &&
      email === undefined
    ) {
      return res.status(400).json({
        message:
          "Please provide at least one field to update.",
      });
    }

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim() === ""
      ) {
        return res.status(400).json({
          message: "Name must be a non-empty string.",
        });
      }

      provider.name = name.trim();
    }

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        email.trim() === ""
      ) {
        return res.status(400).json({
          message: "Email must be a non-empty string.",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: providerId },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email is already registered.",
        });
      }

      provider.email = normalizedEmail;
    }

    await provider.save();

    const safeProvider = provider.toObject();

    delete safeProvider.password;

    return res.status(200).json({
      message: "Provider profile updated successfully.",
      user: safeProvider,
    });
  } catch (error) {
    console.error(
      "Error updating provider profile:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        errors: Object.values(
          error.errors
        ).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message:
        "Server error while updating provider profile.",
    });
  }
};

// ======================================================
// PUBLIC PROFESSIONAL DIRECTORY - FR-13
// ======================================================

// Public: Get all approved providers with optional search
const getPublicProviders = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {
      role: "provider",
      status: "approved",
    };

    if (search && search.trim()) {
      const searchValue = search.trim();

      filter.$or = [
        {
          name: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          email: {
            $regex: searchValue,
            $options: "i",
          },
        },
      ];
    }

    const providers = await User.find(filter)
      .select("name email role status createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      providers,
    });
  } catch (error) {
    console.error(
      "Error fetching public providers:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching professionals.",
    });
  }
};

// ======================================================
// PUBLIC PROFESSIONAL PROFILE - FR-14
// ======================================================

// Public: Get one approved provider profile
const getPublicProviderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid provider ID.",
      });
    }

    const provider = await User.findOne({
      _id: id,
      role: "provider",
      status: "approved",
    }).select("name email role status createdAt");

    if (!provider) {
      return res.status(404).json({
        message:
          "Professional profile not found.",
      });
    }

    const services = await Service.find({
      providerId: provider._id,
    }).sort({
      createdAt: -1,
    });

    const reviews = await Review.find({
      providerId: provider._id,
    })
      .populate("customerId", "name")
      .populate("serviceId", "title")
      .sort({
        createdAt: -1,
      });

    const ratingSummary = await Review.aggregate([
      {
        $match: {
          providerId: provider._id,
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
        ? {
            totalReviews:
              ratingSummary[0].totalReviews,
            averageRating:
              ratingSummary[0].averageRating,
          }
        : {
            totalReviews: 0,
            averageRating: 0,
          };

    return res.status(200).json({
      provider,
      services,
      reviews,
      totalReviews: summary.totalReviews,
      averageRating: summary.averageRating,
    });
  } catch (error) {
    console.error(
      "Error fetching public provider profile:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching professional profile.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  // Admin Dashboard
  getAdminDashboardStats,

  // Admin Customers
  getAllCustomers,
  updateCustomerStatus,

  // Admin Providers
  getAllProviders,
  getPendingProviders,
  approveProvider,
  rejectProvider,
  updateProviderStatus,

  // Customer Profile
  getMyProfile,
  updateMyProfile,

  // Provider Profile
  getMyProviderProfile,
  updateMyProviderProfile,

  // Public Professionals
  getPublicProviders,
  getPublicProviderById,
};