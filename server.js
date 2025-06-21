import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import fcmRoutes from './routes/fcm.js';
import sendUpcomingReminders from './cron/reminderJob.js'; // ✅ Added

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/user', fcmRoutes);

app.get('/', (req, res) => res.send('API Running...'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');

    app.listen(5000, () => {
      console.log('Server running on http://localhost:5000');

      // ✅ Run reminder job every 1 minute
      setInterval(async () => {
        console.log('⏰ Running email reminder job...');
        await sendUpcomingReminders();
      }, 60 * 1000); // Every 1 minute
    });
  })
  .catch(err => console.log('MongoDB connection failed:', err));
