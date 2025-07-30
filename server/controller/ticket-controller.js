const { Ticket } = require("../models/ticket-model");
const Event = require("../models/event-model");
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode'); 


const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("event user");
    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Error fetching ticket', error: error.message });
  }
};

/**
 * Get all tickets for a specific event
 */
const getTicketsByEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Verify the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Fetch tickets for this event
    const tickets = await Ticket.find({ event: eventId })
      .populate('user')
      .populate('event')
      .sort({ purchaseDate: -1 }); // Sort by purchase date descending (newest first)
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets for event:', error);
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
};

/**
 * Get all tickets for the authenticated user
 */
const getTicketsByUser = async (req, res) => {
  try {
    const userId = req.user.user ? req.user.user._id : req.user._id;
    
    console.log("Looking for tickets for user ID:", userId);
    
    // Find all tickets purchased by this user
    const tickets = await Ticket.find({ user: userId })
      .populate({
        path: 'event',
        populate: {
          path: 'venue'
        }
      })
      .sort({ purchaseDate: -1 });
    
    console.log("Found tickets:", tickets.length);
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Error fetching user tickets', error: error.message });
  }
};

const generateTicketPDF = async (ticket, ticketCode) => {
  try {
    // Ensure the event-tickets directory exists
    const ticketsDir = path.join(__dirname, '../uploads/event-tickets');
    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir, { recursive: true });
    }

    const pdfPath = path.join(ticketsDir, `ticket_${ticket._id}_${ticketCode}.pdf`);
    const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 } });

    // Primary brand color
    const primaryColor = '#ED4A43';

    // Generate QR code
    const qrData = JSON.stringify({
      ticketId: ticket._id,
      event: ticket.event.title,
      user: ticket.user.email,
      ticketCode: ticketCode,
      purchaseDate: ticket.purchaseDate
    });

    // Generate QR code image
    const qrCodePath = path.join(__dirname, '../uploads/qrcodes', `qr_${ticket._id}_${ticketCode}.png`);
    await QRCode.toFile(qrCodePath, qrData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Start writing to PDF
    doc.pipe(fs.createWriteStream(pdfPath));

    // Header with logo placeholder and title
    doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);
    doc.fill('#FFFFFF').fontSize(24).font('Helvetica-Bold').text('EVENT TICKET', 50, 50);
    doc.fontSize(12).text(`For: ${ticket.event.title}`, 50, 80);

    // Ticket details section
    doc.fill('#000000').fontSize(14).font('Helvetica-Bold').text('TICKET DETAILS', 50, 150);
    doc.moveTo(50, 170).lineTo(550, 170).stroke(primaryColor);

    // Two-column layout for ticket info
    const leftCol = 50;
    const rightCol = 300;
    let yPos = 190;

    // Ticket information
    doc.fontSize(10).font('Helvetica-Bold').text('Event:', leftCol, yPos);
    doc.font('Helvetica').text(ticket.event.title, leftCol + 100, yPos);

    doc.font('Helvetica-Bold').text('Ticket ID:', rightCol, yPos);
    doc.font('Helvetica').text(ticket._id.toString().substring(0, 10), rightCol + 100, yPos);
    yPos += 25;

    doc.font('Helvetica-Bold').text('Date:', leftCol, yPos);
    doc.font('Helvetica').text(new Date(ticket.event.date).toLocaleDateString(), leftCol + 100, yPos);

    doc.font('Helvetica-Bold').text('Code:', rightCol, yPos);
    doc.font('Helvetica').text(ticketCode, rightCol + 100, yPos);
    yPos += 25;

    doc.font('Helvetica-Bold').text('Venue:', leftCol, yPos);
    doc.font('Helvetica').text(ticket.event.venue.name, leftCol + 100, yPos);
    yPos += 40;

    // QR Code section
    doc.fillColor('black').fontSize(12).font('Helvetica-Bold').text('SCAN FOR ENTRY', 50, yPos);
    doc.image(qrCodePath, 50, yPos + 20, { fit: [100, 100] });

    // Footer
    const footerY = doc.page.height - 50;
    doc.fontSize(8).text('For support, contact support@example.com', 50, footerY);
    doc.text('Generated on ' + new Date().toLocaleString(), 350, footerY);

    doc.end();

    return pdfPath;
  } catch (error) {
    console.error('Error generating ticket PDF:', error);
    throw error;
  }
};

/**
 * Download a ticket PDF
 */
const downloadTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("event")
      .populate("user");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const ticketCode = req.query.code;
    if (!ticketCode || !ticket.ticketCodes?.includes(ticketCode)) {
      return res.status(400).json({ message: "Invalid ticket code" });
    }

    const pdfPath = path.join(__dirname, "../uploads/event-tickets", `ticket_${ticket._id}.pdf`);

    // Check if the file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: "Ticket PDF not found. Please check your email or contact support." });
    }

    // Send the PDF for download
    res.download(pdfPath, `ticket_${ticketCode}.pdf`);
  } catch (error) {
    console.error("Error downloading ticket:", error);
    res.status(500).json({ message: "Error downloading ticket", error: error.message });
  }
};



/**
 * View ticket QR code
 */
const viewTicketQRCode = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const ticketCode = req.query.code; 

    if (!ticketCode) {
      return res.status(400).json({ message: 'Ticket code is required' });
    }

    const userId = req.user.user ? req.user.user._id : req.user._id;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to ticket' });
    }

    // Correct path format
    const qrCodePath = path.join(__dirname, '../uploads/qrcodes', `qr_${ticketId}_${ticketCode}.png`);

    if (!fs.existsSync(qrCodePath)) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    res.sendFile(qrCodePath);
  } catch (error) {
    console.error('Error viewing QR code:', error);
    res.status(500).json({ message: 'Error viewing QR code', error: error.message });
  }
};


/**
 * Delete a ticket
 */
const deleteTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.user ? req.user.user._id : req.user._id;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own tickets' });
    }

    // Delete associated QR code and PDF files for each code
    (ticket.ticketCodes || []).forEach(code => {
      try {
        const qrCodePath = path.join(__dirname, '../uploads/qrcodes', `qr_${ticketId}_${code}.png`);
        if (fs.existsSync(qrCodePath)) fs.unlinkSync(qrCodePath);

        const pdfPath = path.join(__dirname, '../uploads/event-tickets', `ticket_${ticketId}_${code}.pdf`);
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      } catch (error) {
        console.error(`Error deleting files for code ${code}:`, error);
      }
    });

    await Ticket.findByIdAndDelete(ticketId);

    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  }
};


module.exports = { 
  getTicketById, 
  getTicketsByEvent, 
  getTicketsByUser, 
  downloadTicket, 
  viewTicketQRCode,
  deleteTicket
};