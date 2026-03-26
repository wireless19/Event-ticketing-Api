import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      unique: true,
      minLength: 10,
      maxLength: 100,
      match: [/^[A-Za-z\s]*$/, "Name should contain only letters"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      required: [true, "location is required"],
    },
    startDate: {
      type: Date,
      unique: true,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      unique: true,
    },
    openingTime: {
      type: String, // Stored as a string (e.g., "09:00")
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/, // Regex for HH:MM format (24-hour)
      validate: {
        validator: function (v) {
          // You can add more complex logic here if needed
          return v && /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format (HH:MM)!`,
      },
    },
    ticketTypes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TicketType",
        },
      ],
      required: true,
      validate: {
        validator: function (val) {
          // must be an array and not empty
          if (!Array.isArray(val) || val.length === 0) return false;

          // check all are valid ObjectIds
          const allValid = val.every((id) =>
            mongoose.Types.ObjectId.isValid(id),
          );

          if (!allValid) return false;

          // remove duplicates by converting to string
          const uniqueIds = new Set(val.map((id) => id.toString()));

          return uniqueIds.size === val.length;
        },
        message:
          "Ticket types must contain valid ObjectIds, no duplicates, and at least one value",
      },
    },
  },
  { timestamps: true },
);

export const Event = mongoose.model("Event", eventSchema);
