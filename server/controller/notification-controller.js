const Notification = require('../models/notification-model');
const Event = require('../models/event-model');

// Create a new notification
const createNotification = async (userId, title, message, type = "general", relatedItem = null) => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      relatedItem
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(50); // Limit to most recent 50 notifications

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications", error: error.message });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Failed to update notification", error: error.message });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.user._id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Failed to update notifications", error: error.message });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.user._id;

    const result = await Notification.findOneAndDelete({ _id: notificationId, user: userId });

    if (!result) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Failed to delete notification", error: error.message });
  }
};

// Check for events with last day for ticket sales and create notifications
const checkLastDayTicketEvents = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Find events happening tomorrow
    const lastDayEvents = await Event.find({
      date: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('organizer');

    // Create notifications for each event's organizer
    for (const event of lastDayEvents) {
      await createNotification(
        event.organizer._id,
        "Last Day for Ticket Sales!",
        `Today is the last day to buy tickets for "${event.title}"! Don't miss out!`,
        "ticket_reminder",
        { itemId: event._id, itemType: "event" }
      );
    }

  } catch (error) {
    console.error("Error checking last day ticket events:", error);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  checkLastDayTicketEvents
}; 