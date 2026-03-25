import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minLength: 2,
      maxLength: 50,
      match : [/^[A-Za-z\s]*$/, "Name should contain only letters"]
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: [true, "User password is required"],
      select: false,
      minLength: 6,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiresAt: { type: Date, select: false },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
