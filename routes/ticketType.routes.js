import express from "express";
import {
    createTicketType,
    getTicketTypes,
    updateTicketType,
} from "../controllers/ticketType.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const ticketTypeRoutes = express.Router();

ticketTypeRoutes.use(verifyToken);

ticketTypeRoutes.get("/", getTicketTypes);
ticketTypeRoutes.post("/", verifyToken, createTicketType);
ticketTypeRoutes.patch("/:ticket_type_id", verifyToken, updateTicketType);

export default ticketTypeRoutes;