import { Event } from "../models/event.model.js";
// import { TicketType } from "../models/ticketType.model.js";

// Create a event
export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      startDate,
      endDate,
      openingTime,
      ticketTypes,
    } = req.body;

    const event = await Event.create({
      name,
      description,
      location,
      startDate,
      endDate,
      openingTime,
      ticketTypes,
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      error,
    });
  }
};

// Read all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("ticketTypes");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      error,
    });
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!event)
      return res.status(404).json({
        message: "Event not found",
      });

    res.status(200).json({
      message: "Event Updated Successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error", error });
  }
};
