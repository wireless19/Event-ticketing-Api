import mongoose from "mongoose";
import axios from "axios";
import crypto from "crypto";

import { EventAttendee } from "../models/eventAttendee.model.js";
import { Event } from "../models/event.model.js";
import { TicketType } from "../models/ticketType.model.js";

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
    const { name, email, phone, ticketType_id, payment_method } = req.body;

    //Check valid event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.event_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(req.params.event_id);

    //check if event exist
    if (!event) {
      return res.status(401).json({
        error: "event not found",
      });
    }

    // Prevent duplicate registration (KEY FIX)
    const existingRegistration = await EventAttendee.findOne({
      email,
      event: req.params.event_id,
    });

    if (existingRegistration) {
      return res.status(409).json({
        error: "You can't register twice for this event",
      });
    }

    //find ticket type by id and event id
    const attendeeTicketType = await TicketType.findOne({
      _id: ticketType_id,
      event: req.params.event_id,
    }).populate("event", "name");

    if (!attendeeTicketType) {
      return res.status(401).json({
        error: `ticket type for ${attendeeTicketType.event.name} not found`,
      });
    }

    if (attendeeTicketType._id.toString() !== ticketType_id) {
      return res.status(401).json({
        error: "Invalid ticket type",
      });
    }

    //generate all event days
    const days = [];
    let current = new Date(event.startDate);

    while (current <= event.endDate) {
      days.push({
        date: new Date(current),
        status: "absent",
      });

      current.setDate(current.getDate() + 1);
    }

    // generate unique reference for each transaction
    const generateTransactionRef = () => {
      const length = 10;
      // Define the allowed characters (alphanumeric)
      const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";

      for (let i = 0; i < length; i++) {
        // crypto.randomInt is much more secure than Math.random
        const randomIndex = crypto.randomInt(0, charset.length);
        result += charset.charAt(randomIndex);
      }

      return result;
    };

    // Register an attendee in the database for offline payment(the admin will handle this in the dashboard for users who wants to make transfer or pay cash)
    if (payment_method === "offline") {
      // const reference = crypto.randomUUID();
      await EventAttendee.create({
        name,
        email,
        phone,
        paymentMethod: "offline",
        ticketType: attendeeTicketType._id,
        status: "paid",
        event: event._id,
        reference: generateTransactionRef(),
        attendance: days,
      });

      return res.status(201).json({
        message: `Registration successful for ${event.name}`,
      });
    }

    // Register an attendee in the database for online payment and ticket type is free
    if (attendeeTicketType.price === 0) {
      // const reference = crypto.randomUUID();

      await EventAttendee.create({
        name,
        email,
        phone,
        paymentMethod: "online",
        ticketType: attendeeTicketType._id,
        status: "paid",
        event: event._id,
        reference: generateTransactionRef(),
        attendance: days,
      });

      return res.status(201).json({
        message: `Registration successful for ${event.name}`,
      });
    }

    // Register an attendee in the database for online payment with 'pending' status which is by default
    const newBooking = await EventAttendee.create({
      name,
      email,
      phone,
      ticketType: attendeeTicketType._id,
      event: event._id,
      attendance: days,
    });

    //make payment
    const paystackData = {
      email: email, // Customer's email for Paystack
      amount: attendeeTicketType.price * 100, // Paystack expects amount in kobo (multiply by 100)
      callback_url: process.env.PAYSTACK_CALLBACK_URL, // URL Paystack redirects to after payment
      reference: generateTransactionRef(),
      metadata: {
        booking_id: newBooking._id.toString(), // Pass booking ID as metadata for later verification
        // You can add other relevant metadata here
      },
    };

    // Call Paystack API to initialize the transaction
    const paystackResponse = await axios.post(
      `${process.env.PAYSTACK_API_URL}/transaction/initialize`, // Paystack initialize endpoint
      paystackData, // Data to send to Paystack
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Use your Paystack secret key
          "Content-Type": "application/json", // Specify content type
        },
      },
    );

    // Update the booking with the Paystack authorization URL and reference
    // Using findOneAndUpdate to update without fetching and then saving
    await EventAttendee.findOneAndUpdate(
      {
        _id: newBooking._id, // attendee id
        event: { _id: event._id }, // event id
      },
      {
        $set: {
          reference: paystackResponse.data.data.reference, // Set the Paystack reference
        },
      },
      {
        new: true, // return updated document
        runValidators: true, // apply schema validation
      },
    );

    // 5. Send the authorization URL back to the client
    res.status(200).json({
      message: "Payment initialized", // Success message
      authorization_url: paystackResponse.data.data.authorization_url, // URL to redirect user for payment
    });
  } catch (error) {
    console.error(
      "Error initializing payment:",
      error.response ? error.response.data : error.message,
    ); // Log detailed error
    res.status(500).json({
      message: "Payment initialization failed", // Error message for the client
      error: error.response ? error.response.data : error.message, // Include error details
    });
  }
};

export const verifyEventAttendeePayment = async (req, res) => {
  try {
    // 1. Verify Paystack webhook signature
    // Get the Paystack signature from the request headers
    // const paystackSignature = req.headers["x-paystack-signature"];

    // Create a hash of the request body using your Paystack secret key
    // const hash = crypto
    //   .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    //   .update(JSON.stringify(req.body))
    //   .digest("hex");

    // Compare the generated hash with the signature from Paystack
    // if (hash !== paystackSignature) {
    //   // If signatures do not match, it's an invalid request
    //   return res.status(400).send("Webhook signature verification failed");
    // }

    // check if the params are correct
    if (req.params.id !== process.env.GENERATED_IDS) {
      // If signatures do not match, it's an invalid request
      return res.status(400).send("Webhook signature verification failed");
    }

    // 2. Process the webhook event
    const event = req.body; // The entire event object from Paystack

    // Check if the event is a successful transaction
    if (event.event === "charge.success") {
      const reference = event.data.reference; // Get the transaction reference
      const bookingId = event.data.metadata.booking_id; // Retrieve booking ID from metadata

      // 3. Update the booking status in the database
      // Using findOneAndUpdate to find by bookingId and update its status
      const updatedBooking = await EventAttendee.findOneAndUpdate(
        { _id: bookingId, reference }, // Find booking by ID and Paystack reference
        { status: "paid" }, // Set the status to 'paid'
        { new: true, runValidators: true }, // Return the updated document and run schema validators
      );

      if (!updatedBooking) {
        // If booking not found or reference doesn't match, log an error
        console.error(
          `Booking not found or reference mismatch for ID: ${bookingId}, Reference: ${paystackReference}`,
        );
        return res.status(404).send("Booking not found or reference mismatch");
      }

      console.log(`Booking ${updatedBooking._id} status updated to paid.`); // Log successful update
    }

    // 4. Acknowledge receipt of the webhook event
    res.status(200).send("Webhook received and processed");
  } catch (error) {
    console.error("Error processing Paystack webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const markEventAttendance = async (req, res) => {
  try {
    const { attendance, event_id } = req.body;

    //Check valid user ID
    if (!mongoose.Types.ObjectId.isValid(req.params.attendee_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    //check event date
    const eventDate = await Event.findById(event_id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(eventDate.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(eventDate.endDate);
    end.setHours(0, 0, 0, 0);

    if (today < start || today > end) {
      return res.status(400).json({
        message: "Attendance can only be marked during event days",
      });
    }

    // current date + time
    const now = new Date();

    // combine startDate + openingTime
    const [hours, minutes] = eventDate.openingTime.split(":");

    const eventStartDateTime = new Date(eventDate.startDate);
    eventStartDateTime.setHours(hours, minutes, 0, 0);

    // combine endDate (optional: end of day)
    const eventEndDateTime = new Date(eventDate.endDate);
    eventEndDateTime.setHours(23, 59, 59, 999);

    // ❌ before event starts
    if (now < eventStartDateTime) {
      return res.status(400).json({
        message: "Attendance can only be marked after the event starts",
      });
    }

    // ❌ after event ends
    if (now > eventEndDateTime) {
      return res.status(400).json({
        message: "Event has ended",
      });
    }

    // const eventAttendee = await EventAttendee.findOneAndUpdate(
    //   {
    //     _id: req.params.attendee_id, // attendee id
    //     event: { _id: event_id }, // event id
    //   },
    //   {
    //     $set: {
    //       attendance: attendance === 1 ? "present" : "absent",
    //     },
    //   },
    //   {
    //     new: true, // return updated document
    //     runValidators: true, // apply schema validation
    //   },
    // ).populate("event", "name");

    // update only today's attendance
    const eventAttendee = await EventAttendee.findOneAndUpdate(
      {
        _id: req.params.attendee_id,
        event: event_id,
        "attendance.date": today, // match today's date
      },
      {
        $set: {
          "attendance.$.status": attendance === 1 ? "present" : "absent", // update matched day
        },
      },
      {
        new: true,
      },
    ).populate("event", "name");

    if (!eventAttendee)
      return res.status(404).json({
        message: "Attendee not found",
      });

    res.status(200).json({
      message: `${eventAttendee.name} is marked as ${attendance === 1 ? "present" : "absent"} for ${eventAttendee.event.name}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error",
      error: error.message,
    });
  }
};
