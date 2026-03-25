import express from "express";
import dotenv from "dotenv";
dotenv.config();
// import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./db/connectDB.js";

import authroutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import ticketTypeRoutes from "./routes/ticketType.routes.js";
import eventAttendeeRoutes from "./routes/eventAttendee.routes.js";


const app = express();
const PORT = process.env.PORT || 5000;

//2:55:34
//app.use(cors({ origin: "http://localhost:5173", credentials: true })); //replace with your frontend url

app.use(express.json()); // allows us to parse incoming requests:req.body
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
