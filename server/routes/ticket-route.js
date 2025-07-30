const express = require("express");
const { getTicketById, getTicketsByEvent, getTicketsByUser, downloadTicket, viewTicketQRCode, deleteTicket } = require("../controller/ticket-controller");
const verifyToken = require("../middleware/verify-token");
const router = express.Router();

// Get tickets for the currently logged in user
router.get('/user', verifyToken, getTicketsByUser);

// Download a ticket PDF
router.get('/:id/download', verifyToken, downloadTicket);

// View a ticket QR code
router.get('/:id/qrcode', verifyToken, viewTicketQRCode);

// Delete a ticket
router.delete('/:id', verifyToken, deleteTicket);

// Get all tickets for a specific event - this must come BEFORE the /:id route
router.get('/event/:eventId', verifyToken, getTicketsByEvent);

// Get a specific ticket by ID
router.get('/:id', verifyToken, getTicketById);

module.exports = router; 