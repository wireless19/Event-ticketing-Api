import mongoose from "mongoose";

const ticketTypeSchema = new mongoose.Schema(
  {
   name: {
      type: String,
      required: [true, "Ticket type name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "Ticket type price is required"],
      min: [0, "Price must be positive"],
    },
    currency: {
      type: String,
      default: "NGN",
    },
  },
  { timestamps: true },
);

export const TicketType = mongoose.model("TicketType", ticketTypeSchema);
