import express from "express";
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
} from "../controllers/event.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const eventRoutes = express.Router();

eventRoutes.get("/", getEvents);
eventRoutes.get("/:event_id", verifyToken, getEvent);
eventRoutes.post("/", verifyToken, createEvent);
eventRoutes.patch("/update-event/:event_id", verifyToken, updateEvent);

export default eventRoutes;
