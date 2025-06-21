import express from 'express';
import { messaging } from '../config/firebase.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Save FCM token for a user
router.post('/save-fcm-token', auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    // Add token to user's fcmTokens array if not already present
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { fcmTokens: fcmToken } }, // $addToSet prevents duplicates
      { new: true }
    );

    res.json({ message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ message: 'Failed to save FCM token' });
  }
});

// Remove FCM token for a user (when they disable notifications or logout)
router.delete('/remove-fcm-token', auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    // Remove token from user's fcmTokens array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { fcmTokens: fcmToken } },
      { new: true }
    );

    res.json({ message: 'FCM token removed successfully' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ message: 'Failed to remove FCM token' });
  }
});

// Send notification to a specific user
export const sendNotificationToUser = async (userId, notification) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log('No FCM tokens found for user:', userId);
      return;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      tokens: user.fcmTokens, // Send to all user's devices
    };

    const response = await messaging.sendMulticast(message);
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(user.fcmTokens[idx]);
        }
      });
      
      // Remove failed tokens from user's account
      if (failedTokens.length > 0) {
        await User.findByIdAndUpdate(
          userId,
          { $pull: { fcmTokens: { $in: failedTokens } } }
        );
        console.log('Removed failed FCM tokens for user:', userId);
      }
    }

    console.log('Notification sent successfully to user:', userId);
  } catch (error) {
    console.error('Error sending notification to user:', error);
  }
};

// Send notification to all users (admin function)
router.post('/send-to-all', auth, async (req, res) => {
  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const users = await User.find({ fcmTokens: { $exists: true, $ne: [] } });
    const allTokens = users.flatMap(user => user.fcmTokens);

    if (allTokens.length === 0) {
      return res.status(404).json({ message: 'No FCM tokens found' });
    }

    const message = {
      notification: {
        title,
        body,
      },
      tokens: allTokens,
    };

    const response = await messaging.sendMulticast(message);
    
    res.json({ 
      message: 'Notifications sent',
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error('Error sending notifications to all users:', error);
    res.status(500).json({ message: 'Failed to send notifications' });
  }
});

export default router; 