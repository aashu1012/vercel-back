import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendReminderEmail } from '../utils/email.js';
import { sendNotificationToUser } from '../routes/fcm.js';

const sendUpcomingReminders = async () => {
  try {
    const now = new Date();
    const inFiveMin = new Date(now.getTime() + 5 * 60000);

    const tasks = await Task.find({
      completed: false,
      deadline: { $gte: now, $lte: inFiveMin },
    });

    for (const task of tasks) {
      const user = await User.findById(task.user);
      if (user) {
        // Send email notification if enabled
        if (user.notificationPrefs?.email && user.email) {
          const subject = `Reminder: "${task.title}" is due soon!`;
          const text = `Your task "${task.title}" is due by ${task.deadline}. Don't forget to complete it!`;
          await sendReminderEmail(user.email, subject, text);
        }

        // Send push notification if enabled
        if (user.notificationPrefs?.browser) {
          const notification = {
            title: `⏰ Task Reminder: ${task.title}`,
            body: `Due by ${task.deadline}. Don't forget to complete it!`
          };
          await sendNotificationToUser(user._id, notification);
        }
      }
    }
  } catch (err) {
    console.error('Reminder job failed:', err.message);
  }
};

export default sendUpcomingReminders;
