import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Check if user already exists
    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // ✅ Create user directly (no new User + save)
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    // Generate JWT and set cookie
    const token = generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
    });
  } catch (error) {
    console.log("full error", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Include password if you used select: false in schema
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = generateTokenAndSetCookie(res, user._id, user.role);

    // ✅ Update lastLogin using modern method (no save)
    await User.findByIdAndUpdate(user._id, {
      $set: { lastLogin: new Date() },
    });

    // Remove sensitive fields
    // const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token
      //   user: userWithoutPassword,
    });
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate required fields
    if (!email) {
      throw new Error("All fields are required");
    }

    // Validate email
    if (validateEmail(email) === false) {
      throw new Error(`${email} is not a valid email`);
    }

    // Generate reset token + expiry FIRST
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    // Find and update user in one operation
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpiresAt: resetTokenExpiresAt,
        },
      },
      {
        new: true, // return updated document
      },
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash password FIRST
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Find and update user in one operation
    const user = await User.findOneAndUpdate(
      {
        resetPasswordToken: token,
        resetPasswordExpiresAt: { $gt: Date.now() },
      },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetPasswordToken: "",
          resetPasswordExpiresAt: "",
        },
      },
      {
        new: true, // return updated document
      },
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Send success email
    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//change password when logged in
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId; // comes from auth middleware
    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      throw new Error("All fields are required");
    }

    // Get user WITH password (since select: false)
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare current password
    const isMatch = await bcryptjs.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // ✅ Update password using modern method
    await User.findByIdAndUpdate(userId, {
      $set: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("Error in changePassword ", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

//update profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    // basic validaiton to check if the body is empty
    if (!name) {
      return res.status(400).json({
        message: "All field are required for update",
      });
    }

    // Validate name
    if (onlyLettersAndSpaces(name) === false) {
      throw new Error(`Name should contain only letters`);
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    res.status(200).json({
      message: "Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
