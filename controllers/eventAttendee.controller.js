import mongoose from "mongoose";
import { EventAttendee } from "../models/eventAttendee.model.js";
import { Event } from "../models/event.model.js";
// import { TicketType } from "../models/ticketType.model.js";

// Get Registered Attendees For An Event
export const getRegisteredAttendeesForAnEvent = async (req, res, next) => {
  try {
    //Check valid event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.event_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Check if event exists
    const event = await Event.findById(req.params.event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Fetch attendees
    const registeredAttendeesForAnEvent = await EventAttendee.find({
      event: req.params.event_id,
    })
      .populate("event", "name")
      .populate("ticketType", "name price");

    // Check if no attendees
    if (registeredAttendeesForAnEvent.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Attendees not found",
      });
    }

    res
      .status(200)
      .json({ success: true, data: registeredAttendeesForAnEvent });
  } catch (error) {
    next(error);
  }
};

export const registerEventAttendee = async (req, res) => {
  try {
    const { name, email, phone, ticketType } = req.body;

    //Check valid event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.event_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(req.params.event_id).populate(
      "ticketTypes",
    );

    //check if event exist
    if (!event) {
      return res.status(401).json({
        message: "event not found",
      });
    }

    // Prevent duplicate registration (KEY FIX)
    const existingRegistration = await EventAttendee.findOne({
      email,
      event: req.params.event_id,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: "You can't register twice for this event",
      });
    }

    //check ticket type is correct
    const ticketTypeExist = event.ticketTypes.some(
      (singleTicketType) => singleTicketType._id.toString() === ticketType,
    );
    if (!ticketTypeExist) {
      return res.status(401).json({
        message: "Invalid ticket type",
      });
    }

    await EventAttendee.create({
      name,
      email,
      phone,
      ticketType,
      event: event._id,
    });

    //send receipt email to attendee----->registration successful, to confirm your reservation please make your payment to the account below

    res.status(201).json({
      message: `Registration successful for ${event.name}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      error: error.message,
    });
  }
};

export const updateEventAttendeeStatus = async (req, res) => {
  try {
    const { status, event_id } = req.body;

    //Check valid user ID
    if (!mongoose.Types.ObjectId.isValid(req.params.attendee_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Check if attendee status is paid
    const eventAttendeeStatus = await EventAttendee.findById(
      req.params.attendee_id,
    );
    if (
      eventAttendeeStatus.status === "paid" &&
      eventAttendeeStatus.event._id.toString() === event_id
    ) {
      return res.status(404).json({
        success: false,
        message: "Status is paid already",
      });
    }

    const eventAttendee = await EventAttendee.findOneAndUpdate(
      {
        _id: req.params.attendee_id, // attendee id
        event: { _id: event_id }, // event id
      },
      {
        $set: {
          status: status,
        },
      },
      {
        new: true, // return updated document
        runValidators: true, // apply schema validation
      },
    );

    if (!eventAttendee)
      return res.status(404).json({
        message: "Attendee not found",
      });

    res.status(200).json({
      message: "Payment status updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      error,
    });
  }
};
