const cron = require('node-cron');
const MockInterview = require('../models/MockInterview');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

const startCronJobs = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Running interview cleanup & reminders...');
    const now = new Date();

    try {
      const allExpired = await MockInterview.find({
        status: { $in: ['pending', 'scheduled'] },
      });

      for (const interview of allExpired) {
        const dateStr = interview.preferredDate.toISOString().split('T')[0];
        const scheduledAt = new Date(`${dateStr}T${interview.preferredTime}`);

        if (isNaN(scheduledAt.getTime())) continue;

        const diffMs = scheduledAt.getTime() - now.getTime();
        const diffMins = diffMs / (1000 * 60);

        // Expire unaccepted pending requests
        if (interview.status === 'pending' && diffMins < 0) {
          interview.status = 'cancelled';
          await interview.save();
          console.log(`[Cron] Expired pending interview ${interview._id}`);
        }

        // Send 2-hour reminder for scheduled interviews
        if (interview.status === 'scheduled' && !interview.reminderSent && diffMins > 0 && diffMins <= 120) {
          const requester = await User.findById(interview.requester);
          const interviewer = await User.findById(interview.interviewer);

          const emailHtml = `
            <h2>Interview Reminder</h2>
            <p>Your <strong>${interview.domain}</strong> mock interview is in less than 2 hours!</p>
            <p><strong>Date:</strong> ${interview.preferredDate.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${interview.preferredTime}</p>
            <p>Login to CampusConnect to join the interview.</p>
          `;

          const emails = [];
          if (requester?.email) {
            emails.push(sendEmail({ to: requester.email, subject: `Reminder: ${interview.domain} Interview in 2 hours`, html: emailHtml }));
          }
          if (interviewer?.email) {
            emails.push(sendEmail({ to: interviewer.email, subject: `Reminder: ${interview.domain} Interview in 2 hours`, html: emailHtml }));
          }
          await Promise.allSettled(emails);

          interview.reminderSent = true;
          await interview.save();
          console.log(`[Cron] Sent reminder for interview ${interview._id}`);
        }
      }
    } catch (error) {
      console.error('[Cron] Error:', error.message);
    }
  });
};

module.exports = startCronJobs;
