import express from "express";
import dotenv from "dotenv";
dotenv.config();
// import cors from "cors";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

import cookieParser from "cookie-parser";

import { connectDB } from "./db/connectDB.js";

import authroutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import ticketTypeRoutes from "./routes/ticketType.routes.js";
import eventAttendeeRoutes from "./routes/eventAttendee.routes.js";


const app = express();
const PORT = process.env.PORT || 5000;

// Configure the speed limiter (delay after 8 reqs)
const speedLimiter = slowDown({
  windowMs: 5 * 60 * 1000,
  delayAfter: 8,
  delayMs: 500,
});


const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 15, // each IP can make up to 15 requests per `windowsMs` (5 minutes)
  standardHeaders: false, // add the `RateLimit-*` headers to the response
  legacyHeaders: false, // remove the `X-RateLimit-*` headers from the response
});


//2:55:34
//app.use(cors({ origin: "http://localhost:5173", credentials: true })); //replace with your frontend url
app.use(speedLimiter);
app.use(limiter);

// IMPORTANT: Paystack webhook body needs to be raw for signature verification
// So, we apply the JSON body parser only to routes *before* the webhook route
// Or, use a conditional body parser if the webhook route is within the same router

// For all routes EXCEPT /api/payment/webhook, parse JSON
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/event-attendees/webhook') {
    next(); // Skip JSON parsing for webhook route
  } else {
    express.json()(req, res, next); // Apply JSON parsing for other routes
  }
});

// app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(express.urlencoded({ extended: false })); // process the form data sent via html forms in a simple format
app.use(cookieParser()); // allows us to parse incoming cookies

app.use("/api/v1/auth", authroutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/ticket-types", ticketTypeRoutes);
app.use("/api/v1/event-attendees", eventAttendeeRoutes);

// app.listen(PORT, () => {
//     connectDB();
//   console.log(`server running on port ${PORT}`);
// });
const startServer = async () => {
  try {
    await connectDB(); // connect db FIRST

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
