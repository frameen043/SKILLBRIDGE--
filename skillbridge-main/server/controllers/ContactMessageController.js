const mongoose = require("mongoose");
const ContactMessage = require("../models/ContactMessage");

// Public: Submit a contact message
const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (
      !name ||
      !name.trim() ||
      !email ||
      !email.trim() ||
      !subject ||
      !subject.trim() ||
      !message ||
      !message.trim()
    ) {
      return res.status(400).json({
        message:
          "Name, email, subject, and message are required.",
      });
    }

    // Create contact message
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      message: "Contact message submitted successfully.",
      contactMessage,
    });
  } catch (error) {
    console.error(
      "Error creating contact message:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        errors: Object.values(error.errors).map(
          (err) => err.message
        ),
      });
    }

    return res.status(500).json({
      message:
        "Server error while submitting contact message.",
    });
  }
};

// Admin: Get all contact messages
const getAllContactMessages = async (req, res) => {
  try {
    const contactMessages = await ContactMessage.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      contactMessages,
    });
  } catch (error) {
    console.error(
      "Error fetching contact messages:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching contact messages.",
    });
  }
};

// Admin: Update contact message status
const updateContactMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid contact message ID.",
      });
    }

    // Only read/unread are valid statuses
    if (
      status !== "read" &&
      status !== "unread"
    ) {
      return res.status(400).json({
        message:
          'Status must be either "read" or "unread".',
      });
    }

    const contactMessage =
      await ContactMessage.findById(id);

    if (!contactMessage) {
      return res.status(404).json({
        message: "Contact message not found.",
      });
    }

    contactMessage.status = status;
    await contactMessage.save();

    return res.status(200).json({
      message: `Contact message marked as "${status}".`,
      contactMessage,
    });
  } catch (error) {
    console.error(
      "Error updating contact message status:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating contact message.",
    });
  }
};

module.exports = {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
};