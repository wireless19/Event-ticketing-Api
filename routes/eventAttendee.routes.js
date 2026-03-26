import express from "express";
import {
    getRegisteredAttendeesForAnEvent,
    registerEventAttendee,
    verifyEventAttendeePayment,
    markEventAttendance,
} from "../controllers/eventAttendee.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const eventAttendeeRoutes = express.Router();

eventAttendeeRoutes.get("/event/:event_id", verifyToken, getRegisteredAttendeesForAnEvent);
eventAttendeeRoutes.post("/register/:event_id", registerEventAttendee);
eventAttendeeRoutes.post("/webhook/:id", verifyEventAttendeePayment);
eventAttendeeRoutes.patch("/update-attendance/:attendee_id", verifyToken, markEventAttendance);

export default eventAttendeeRoutes;