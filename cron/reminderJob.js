import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendReminderEmail } from '../utils/email.js';
import { sendNotificationToUser } from '../routes/fcm.js';
import { format, utcToZonedTime } from 'date-fns-tz';

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
          const timeZone = 'Asia/Kolkata';
          const zonedDate = utcToZonedTime(task.deadline, timeZone);
          const formattedDeadline = format(zonedDate, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone });
          const text = `Your task "${task.title}" is due by ${formattedDeadline}. Don't forget to complete it!`;
          await sendReminderEmail(user.email, subject, text);
        }

        // Send push notification if enabled
        if (user.notificationPrefs?.browser) {
          const timeZone = 'Asia/Kolkata';
          const zonedDate = utcToZonedTime(task.deadline, timeZone);
          const formattedDeadline = format(zonedDate, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone });
          const notification = {
            title: `⏰ Task Reminder: ${task.title}`,
            body: `Due by ${formattedDeadline}. Don't forget to complete it!`
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
