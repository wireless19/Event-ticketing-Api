import mongoose from "mongoose";

const eventAttendee = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minLength: 3,
      maxLength: 40,
      match: [/^[A-Za-z\s]*$/, "Name should contain only letters"],
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
      match: [
        /^(?:\+234|0)[789][01]\d{8}$/,
        "Please enter a valid phone number",
      ],
    },
    paymentMethod: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
    ticketType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketType",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true, //optimizing the queries by indexing the user field
    },
    reference: {
      type: String, // Paystack transaction reference
      sparse: true, // Allow null values for non-paid bookings without violating unique constraint
    },
  },
  { timestamps: true },
);

//  Correct unique rule
eventAttendee.index(
  { email: 1, name: 1, phone: 1, event: 1, paystackReference: 1 },
  { unique: true },
);

export const EventAttendee = mongoose.model("EventAttendee", eventAttendee);
