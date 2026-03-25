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
eventRoutes.get("/:id", verifyToken, getEvent);
eventRoutes.post("/", verifyToken, createEvent);
eventRoutes.patch("/update-event/:id", verifyToken, updateEvent);

export default eventRoutes;
