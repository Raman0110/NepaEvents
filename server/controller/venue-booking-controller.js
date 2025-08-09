require('dotenv').config()
const Event = require("../models/event-model");
const VenueBooking = require("../models/venue-booking-model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Receipt } = require("../models/ticket-model");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require('qrcode');
const { createNotification } = require('./notification-controller');

const bookVenue = async (req, res) => {
  try {
    const { title, description, category, date, artist, ticketPrice, venue } = req.body;
    const image = req.file ? req.file.path : null;

    // Check if the venue is already booked for this date
    const bookingDate = new Date(date);
    const existingBooking = await VenueBooking.findOne({
      venue: venue,
      status: "approved",
      "eventDetails.date": {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lte: new Date(bookingDate.setHours(23, 59, 59, 999))
      }
    }).populate("organizer", "fullName email");

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "This venue is already booked for the selected date",
        booking: {
          id: existingBooking._id,
          date: existingBooking.eventDetails.date,
          bookedBy: existingBooking.organizer.fullName
        }
      });
    }

    const eventDetails = { title, description, category, date, artist, ticketPrice, image };
    const organizer = req.user.user._id;
    const newBooking = await VenueBooking.create({
      organizer,
      eventDetails,
      venue,
      status: "pending",
      requestedAt: Date.now()
    })
    res.status(201).json({ success: true, message: "Venue Booking requested successfully", booking: newBooking })
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Error Booking Venue", error: err.message });
  }
}

const getAllVenueBooking = async (req, res) => {
  try {
    const bookings = await VenueBooking.find()
      .populate("venue")
      .populate("organizer")
      .populate("eventDetails.category");
    res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Error Fetching Bookings", error: err.message });
  }
}

const getVenueBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await VenueBooking.findById(id)
      .populate("venue")
      .populate("organizer")
      .populate("eventDetails.category");
    res.status(200).json({ success: true, booking })
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Error Fetching Bookings", error: err.message });
  }
}


const approveVenueBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await VenueBooking.findById(id).populate('organizer');
    if (!booking) return res.status(404).json({ success: false, message: "No Booking found!" });

    booking.status = "approved";
    await booking.save();

    await createNotification(
      booking.organizer._id,
      "Venue Booking Approved!",
      "Great news! Your venue booking has been approved.",
      "venue_approval",
      { itemId: booking._id, itemType: "booking" }
    );

    res.status(200).json({
      success: true,
      message: "Booking approved. You Can Make Payment Now",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error Approving Bookings", error: error.message });
  }
}

const rejectVenueBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await VenueBooking.findById(id);

    if (!booking) return res.status(404).json({ success: false, message: "No booking found!" });

    booking.status = "rejected";
    await booking.save();

    await createNotification(
      booking.organizer._id,
      "Venue Booking Rejected!",
      "Your venue booking has been rejected Please try again",
      "venue_rejection",
      { itemId: booking._id, itemType: "booking" }
    );

    res.status(200).json({ success: true, message: "Booking rejected successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error Rejecting Bookings", error: error.message });
  }
}

//stripe payment
const makePaymentForVenue = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await VenueBooking.findById(bookingId).populate("venue organizer");
    if (!booking) return res.status(404).json({ message: "Booking not found!" });
    if (booking.status !== "approved") return res.status(400).json({ message: "Booking is not approved yet" });
    const totalAmount = booking.venue.price;
    const venueImage = `http://localhost:3000/${booking.venue.image.replace(/\\/g, "/")}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/payment-failure`,
      customer_email: booking.organizer.email,
      line_items: [
        {
          price_data: {
            currency: "npr",
            product_data: {
              name: `Venue Booking: ${booking.venue.name}`,
              images: [venueImage],
            },
            unit_amount: totalAmount * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
      },
    })
    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ message: "Error creating payment session", error: error.message });
  }
}

//automatically called by stripe creates event, Receipt
const stripeWebHook = async (req, res) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];

    const rawBody = req.body;

    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      console.log("Checkout session completed event received!");
      res.json({ received: true });
    }
  } catch (error) {
    console.error(" Webhook Error:", error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};


const sendReceiptEmail = async (email, receipt) => {
  try {
    const receiptsDir = path.join(__dirname, "../uploads/receipts");

    // Ensure the receipts folder exists
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const pdfPath = path.join(receiptsDir, `receipt_${receipt._id}.pdf`);
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Primary brand color
    const primaryColor = '#ED4A43';

    // Generate QR code data
    const qrData = JSON.stringify({
      organizer: receipt.organizer.fullName,
      venue: receipt.venue.name,
      amountPaid: receipt.amountPaid,
      transactionId: receipt.transactionId,
      paymentDate: new Date(),
    });

    // Create branded QR code with NepaEvents initials in black color
    const qrCodeOptions = {
      errorCorrectionLevel: 'H', // High error correction to allow for logo overlay
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    // Generate the QR code as an image
    const qrCodeBuffer = await QRCode.toBuffer(qrData, qrCodeOptions);

    // Create a canvas to overlay NepaEvents initials on the QR code
    const { createCanvas, loadImage } = require('canvas');
    const canvas = createCanvas(300, 300); // Size of the canvas
    const ctx = canvas.getContext('2d');

    // Draw the QR code on the canvas
    const qrImage = await loadImage(qrCodeBuffer);
    ctx.drawImage(qrImage, 0, 0, 300, 300);

    // Add NepaEvents initials in the center
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(115, 130, 70, 40);

    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#000000'; // Black color for the text as requested
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NE', 150, 150); // NE for NepaEvents initials

    // Convert canvas to buffer
    const brandedQRBuffer = canvas.toBuffer('image/png');

    // Start writing to PDF
    doc.pipe(fs.createWriteStream(pdfPath));

    // Header with logo placeholder and title
    doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);
    doc.fill('#FFFFFF').fontSize(24).font('Helvetica-Bold').text('BOOKING RECEIPT', 50, 50);
    doc.fontSize(12).text('Thank you for your venue booking', 50, 80);

    // Receipt details section
    doc.fill('#000000').fontSize(14).font('Helvetica-Bold').text('RECEIPT DETAILS', 50, 150);
    doc.moveTo(50, 170).lineTo(550, 170).stroke(primaryColor);

    // Two-column layout for receipt info
    const leftCol = 50;
    const rightCol = 300;
    let yPos = 190;

    // Receipt information
    doc.fontSize(10).font('Helvetica-Bold').text('Venue:', leftCol, yPos);
    doc.font('Helvetica').text(receipt.venue.name, leftCol + 100, yPos);

    doc.font('Helvetica-Bold').text('Receipt ID:', rightCol, yPos);
    doc.font('Helvetica').text(receipt._id.toString().substring(0, 10), rightCol + 100, yPos);
    yPos += 25;

    doc.font('Helvetica-Bold').text('Location:', leftCol, yPos);
    doc.font('Helvetica').text(receipt.venue.location, leftCol + 100, yPos);

    doc.font('Helvetica-Bold').text('Date:', rightCol, yPos);
    doc.font('Helvetica').text(new Date(receipt.paymentDate).toLocaleDateString(), rightCol + 100, yPos);
    yPos += 25;

    doc.font('Helvetica-Bold').text('Organizer:', leftCol, yPos);
    doc.font('Helvetica').text(receipt.organizer.fullName, leftCol + 100, yPos);

    doc.font('Helvetica-Bold').text('Time:', rightCol, yPos);
    doc.font('Helvetica').text(new Date(receipt.paymentDate).toLocaleTimeString(), rightCol + 100, yPos);
    yPos += 40;

    // Payment details section
    doc.fill('#000000').fontSize(14).font('Helvetica-Bold').text('PAYMENT DETAILS', 50, yPos);
    yPos += 20;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke(primaryColor);
    yPos += 20;

    // Payment information - Table header
    doc.fillColor(primaryColor).rect(50, yPos, 500, 30).fill();
    doc.fillColor('white');
    doc.text('Description', 70, yPos + 10);
    doc.text('Transaction ID', 250, yPos + 10);
    doc.text('Amount', 450, yPos + 10);
    yPos += 30;

    // Payment information - Table row
    doc.fillColor('#F6F6F6').rect(50, yPos, 500, 30).fill();
    doc.strokeColor('#CCCCCC').rect(50, yPos, 500, 30).stroke();
    doc.fillColor('black');
    doc.text('Venue Booking', 70, yPos + 10);

    // Handle potentially undefined transaction ID
    const transactionIdText = receipt.transactionId ?
      (receipt.transactionId.length > 15 ? receipt.transactionId.substring(0, 15) + '...' : receipt.transactionId) :
      'N/A';
    doc.text(transactionIdText, 250, yPos + 10);

    // Make sure amount is properly formatted
    const amountText = receipt.amountPaid ? `$${parseFloat(receipt.amountPaid).toFixed(2)}` : 'N/A';
    doc.text(amountText, 450, yPos + 10);
    yPos += 50;

    // Total amount
    doc.font('Helvetica-Bold').text('Total Amount Paid:', 350, yPos);
    yPos += 20; // Add spacing to prevent overlap
    doc.fillColor(primaryColor).text(amountText, 450, yPos);
    yPos += 60; // Move cursor further for the next section

    // QR Code section with branded QR
    doc.fillColor('black').fontSize(12).font('Helvetica-Bold').text('SCAN FOR VERIFICATION', 50, yPos);
    doc.image(brandedQRBuffer, 50, yPos + 20, { fit: [100, 100] });

    // Thank you message
    doc.fontSize(10).font('Helvetica').text('This receipt serves as proof of payment for your venue booking.', 200, yPos + 30);
    doc.text('Please keep this for your records.', 200, yPos + 50);

    // Footer
    const footerY = doc.page.height - 50;
    doc.fontSize(8).text('For support, contact support@example.com', 50, footerY);
    doc.text('Generated on ' + new Date().toLocaleString(), 350, footerY);

    doc.end();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: `Your Receipt for Venue Booking`,
      text: `Thank you for booking a venue. Your receipt is attached.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
          <div style="background-color: #ED4A43; padding: 20px; text-align: center; color: white;">
            <h1>Venue Booking Receipt</h1>
          </div>
          <div style="padding: 20px;">
            <p>Dear ${receipt.organizer.fullName},</p>
            <p>Thank you for your venue booking. Your payment has been successfully processed.</p>
            <p><strong>Venue:</strong> ${receipt.venue.name}</p>
            <p><strong>Amount Paid:</strong> ${amountText}</p>
            <p><strong>Transaction ID:</strong> ${receipt.transactionId || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(receipt.paymentDate).toLocaleString()}</p>
            <p>Please find your receipt attached to this email.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px;">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
      attachments: [{ filename: `receipt_${receipt._id}.pdf`, path: pdfPath }],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Receipt email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending receipt email:", error);
    return false;
  }
};


const verifyPayment = async (req, res) => {
  try {
    const session_id = req.query.session_id;
    if (!session_id) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const booking = await VenueBooking.findById(req.params.id)
        .populate("venue organizer")
        .populate("eventDetails.category");

      if (!booking) {
        return res.status(404).json({ message: "Booking not found!" });
      }

      // First, check if payment has already been processed
      if (booking.paymentStatus === 'paid') {
        const existingEvent = await Event.findOne({
          title: booking.eventDetails.title,
          date: booking.eventDetails.date,
          venue: booking.venue._id
        });

        return res.status(200).json({
          success: true,
          message: "Payment already processed",
          event: existingEvent
        });
      }

      // Only proceed with event creation if payment is new
      const newEvent = new Event({
        title: booking.eventDetails.title,
        description: booking.eventDetails.description,
        date: booking.eventDetails.date,
        venue: booking.venue._id,
        artist: booking.eventDetails.artist,
        organizer: booking.organizer._id,
        category: booking.eventDetails.category._id,
        price: booking.eventDetails.ticketPrice,
        image: booking.eventDetails.image,
      });
      await newEvent.save();

      // Update booking payment status
      booking.paymentStatus = 'paid';
      await booking.save();

      // Generate receipt
      const receipt = new Receipt({
        organizer: booking.organizer._id,
        venue: booking.venue._id,
        amountPaid: booking.venue.price,
        transactionId: session.payment_intent,
        paymentDate: new Date(),
      });
      await receipt.save();

      // Send receipt email with tracking code
      const populatedReceipt = await Receipt.findById(receipt._id)
        .populate("organizer")
        .populate("venue");
      await sendReceiptEmail(
        populatedReceipt.organizer.email,
        populatedReceipt
      );

      // Create payment success notification
      const { createNotification } = require('./notification-controller');
      await createNotification(
        booking.organizer._id,
        "Payment Successful!",
        "Payment successful! Your venue booking is now confirmed.",
        "payment_success",
        { itemId: booking._id, itemType: "booking" }
      );

      res.status(200).json({
        success: true,
        message: "Payment verified and receipt sent to email",
        event: newEvent
      });
    } else {
      res.json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

// Get receipts for the currently logged in user
const getUserReceipts = async (req, res) => {
  try {
    if (!req.user || !req.user.user || !req.user.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const userId = req.user.user._id;
    console.log(`Fetching receipts for user: ${userId}`);

    // Find all receipts where the user is the organizer
    const receipts = await Receipt.find({ organizer: userId })
      .populate("venue")
      .sort({ paymentDate: -1 }); // Sort by payment date, newest first

    console.log(`Found ${receipts.length} receipts`);

    res.status(200).json({
      success: true,
      receipts
    });
  } catch (error) {
    console.error("Error fetching user receipts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message
    });
  }
};

// Download receipt for a specific booking
const downloadReceipt = async (req, res) => {
  try {
    const receiptId = req.params.id;
    const receipt = await Receipt.findById(receiptId)
      .populate("organizer")
      .populate("venue");

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found"
      });
    }

    const receiptPath = path.join(__dirname, `../uploads/receipts/receipt_${receipt._id}.pdf`);

    // Check if receipt file exists
    if (!fs.existsSync(receiptPath)) {
      // Generate receipt if it doesn't exist
      await sendReceiptEmail(receipt.organizer.email, receipt);
    }

    res.download(receiptPath, `venue_receipt_${receipt._id}.pdf`);
  } catch (error) {
    console.error("Error downloading receipt:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download receipt",
      error: error.message
    });
  }
};

module.exports = { bookVenue, getAllVenueBooking, approveVenueBooking, rejectVenueBooking, makePaymentForVenue, stripeWebHook, verifyPayment, sendReceiptEmail, getVenueBookingById, getUserReceipts, downloadReceipt }