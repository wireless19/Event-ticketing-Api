import mongoose from "mongoose";
import { Event } from "../models/event.model.js";
// import { TicketType } from "../models/ticketType.model.js";

// Create a event
export const createEvent = async (req, res) => {
  try {
    const { name, description, location, address, startDate, endDate, openingTime } =
      req.body;

    // Check for duplicate event name (optional, but good for clarity)
    const existingEventByName = await Event.findOne({ name });
    if (existingEventByName) {
      return res.status(400).json({
        error: `An event with the name "${name}" already exists.`,
      });
    }

    // Check for duplicate event description
    const existingEventByDescription = await Event.findOne({ description });
    if (existingEventByDescription) {
      return res.status(400).json({
        error: `An event with the description "${description}" already exists.`,
      });
    }

    // Get today's date at the start of the day for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert dates to Date objects for proper comparison
    const newStartDate = new Date(startDate);
    const newEndDate = endDate ? new Date(endDate) : null; // endDate can be optional

    // Prevent past dates for startDate
    if (newStartDate < today) {
      return res.status(400).json({
        error: "Start date cannot be in the past.",
      });
    }

    // Prevent past dates for endDate (if provided)
    if (newEndDate && newEndDate < today) {
      return res.status(400).json({
        error: "End date cannot be in the past.",
      });
    }

    // Validate input dates ---
    if (newEndDate && newStartDate > newEndDate) {
      return res.status(400).json({
        error: "Start date cannot be after end date.",
      });
    }

    // Check for overlapping event dates
    // Find any existing event whose date range overlaps with the new event's date range
    const overlappingEvent = await Event.findOne({
      $or: [
        // Case 1: Existing event starts before new event ends AND new event starts before existing event ends
        // This covers all overlap scenarios (new event fully within existing, existing fully within new, partial overlaps)
        {
          startDate: { $lte: newEndDate || newStartDate }, // Existing event starts before or on new event's end date
          endDate: { $gte: newStartDate }, // Existing event ends after or on new event's start date
        },
        // Handle events without an explicit endDate (single-day events)
        {
          startDate: { $lte: newStartDate }, // Existing single-day event is on or before new event's start
          endDate: null, // Existing event has no end date
          $or: [
            { startDate: { $gte: newStartDate } }, // Existing single-day event is on or after new event's start
            { startDate: { $lte: newEndDate || newStartDate } }, // Existing single-day event is on or before new event's end
          ],
        },
        {
          startDate: { $lte: newEndDate || newStartDate }, // New single-day event is on or before existing event's end
          endDate: { $gte: newStartDate }, // New single-day event is on or after existing event's start
          startDate: null, // New event has no end date (handled by newEndDate being null)
        },
      ],
    });

    if (overlappingEvent) {
      return res.status(400).json({
        error: `An event already exists within the selected date range: ${overlappingEvent.name} (${overlappingEvent.startDate.toDateString()} - ${overlappingEvent.endDate ? overlappingEvent.endDate.toDateString() : "No End Date"})`,
      });
    }

    const event = await Event.create({
      name,
      description,
      location,
      address,
      startDate,
      endDate,
      openingTime,
      // ticketTypes,
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
    const events = await Event.find();
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
    //Check valid event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.event_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }
    const event = await Event.findById(req.params.event_id);
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
    //Check valid event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.event_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findByIdAndUpdate(req.params.event_id, req.body, {
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
