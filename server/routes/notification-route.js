const express = require('express');
const { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification
} = require('../controller/notification-controller');
const verifyToken = require('../middleware/verify-token');

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', verifyToken, getUserNotifications);

// Mark a notification as read
router.put('/:notificationId/read', verifyToken, markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', verifyToken, markAllNotificationsAsRead);

// Delete a notification
router.delete('/:notificationId', verifyToken, deleteNotification);

module.exports = router; 