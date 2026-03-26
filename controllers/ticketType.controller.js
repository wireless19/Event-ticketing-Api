import mongoose from "mongoose";
import { TicketType } from "../models/ticketType.model.js";

// Create a ticketType
export const createTicketType = async (req, res) => {
  try {
    const { name, price, event } = req.body;
    console.log("tickettype", req.body);

    const ticketType = await TicketType.create({ name, price, event });

    res.status(201).json({
      message: "TicketType created successfully",
      ticketType,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      error,
    });
  }
};

// Read all ticketTypes
export const getTicketTypes = async (req, res) => {
  try {
    const events = await TicketType.find().populate("event");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      error,
    });
  }
};

// Read all ticketTypes by event id
export const getTicketTypesByEventId = async (req, res) => {
  try {
    //Check valid event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.event_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket type Id",
      });
    }
    const ticketTypesByEventId = await TicketType.find({
      event: req.params.event_id,
    }).populate("event");
    res.status(200).json(ticketTypesByEventId);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      error,
    });
  }
};

// Update a ticket type
export const updateTicketType = async (req, res) => {
  try {
    //Check valid ticket type ID
    if (!mongoose.Types.ObjectId.isValid(req.params.ticket_type_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket type Id",
      });
    }
    const ticketType = await TicketType.findByIdAndUpdate(
      req.params.ticket_type_id,
      req.body,
      {
        new: true,
      },
    );

    if (!ticketType)
      return res.status(404).json({
        message: "Ticket type not found",
      });

    res.status(200).json({
      message: "Ticket type Updated Successfully",
      ticketType,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server error", message: error.message });
  }
};
