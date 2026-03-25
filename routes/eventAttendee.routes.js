import express from "express";
import {
    getRegisteredAttendeesForAnEvent,
    registerEventAttendee,
    updateEventAttendeeStatus,
} from "../controllers/eventAttendee.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const eventAttendeeRoutes = express.Router();

eventAttendeeRoutes.get("/event/:event_id", verifyToken, getRegisteredAttendeesForAnEvent);
eventAttendeeRoutes.post("/register/:event_id", registerEventAttendee);
eventAttendeeRoutes.patch("/update-attendee-status/:attendee_id", verifyToken, updateEventAttendeeStatus);

export default eventAttendeeRoutes;