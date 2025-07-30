require('dotenv').config()
const express = require('express');
const connectToDB = require('./database/connection')
const userRoute = require('./routes/user-route')
const cors = require("cors");
const eventRouter = require('./routes/event-route');
const venueRouter = require('./routes/venue-route');
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const artistRouter = require('./routes/artist-route');
const ticketRouter = require('./routes/ticket-route');
const categoryRouter = require("./routes/category-route");
const venueBookingRouter = require("./routes/venue-booking-route");
const notificationRouter = require("./routes/notification-route");
const adminRouter = require("./routes/admin-route");
const paymentRouter = require("./routes/payment-route");
const { stripeWebHook } = require('./controller/venue-booking-controller');
const { checkLastDayTicketEvents } = require('./controller/notification-controller');
const path = require("path");
const cron = require('node-cron');

const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(userRoute);
app.use("/receipts", express.static(path.join(__dirname, "../receipts")));
app.use("/api/event", eventRouter);
app.use("/api/venue", venueRouter);
app.use("/api/artist", artistRouter);
app.use("/api/ticket", ticketRouter);
app.use('/api/users', userRoute);
app.use("/api/category", categoryRouter);
app.use("/api/contact", require("./routes/contact-route"));
app.use("/api/venue-bookings", venueBookingRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payments", paymentRouter);
app.post("/webhook", bodyParser.raw({ type: "application/json" }), stripeWebHook);
app.use('/uploads', express.static('uploads'));
connectToDB();

// Schedule daily check for ticket last day notifications (runs at midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled task: checking for last day ticket events');
  await checkLastDayTicketEvents();
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`)
});
