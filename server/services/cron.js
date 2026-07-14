const cron = require('node-cron');
const MockInterview = require('../models/MockInterview');
const Placements = require('../models/Placement')
const { sendEmail } = require('../utils/email');
const Placement = require('../models/Placement');

const startCronJobs = () => {
  cron.schedule('*/1 * * * *', async () => {
    console.log('[Cron] Running interview cleanup & reminders...');
    const now = new Date();

    
      // 1. CLEANUP: Cancel expired pending interviews directly in the DB
      const cancelInterview = await MockInterview.updateMany(
        {
          status: 'pending',
          preferredDate: { $lte: now } // Assumes preferredDate holds a complete timestamp or localized date
        },
        { $set: { status: 'cancelled' } }
      );
      if (cancelInterview.modifiedCount > 0) {
        console.log(`[Cron] Auto-cancelled ${cancelInterview.modifiedCount} pending interviews.`);
      }


      //2. CLEANUP: Cancel expired placement drives
      const completedPlacement = await Placements.updateMany(
        {
          status: 'upcoming',
          applicationDeadline: { $lt: now } // Assumes preferredDate holds a complete timestamp or localized date
        },
        { $set: { status: 'completed' } }
      );
      
      if (completedPlacement.modifiedCount > 0) {
        console.log(`[Cron] Completed ${completedPlacement.modifiedCount} upcoming placement.`);
      }

      
  });
};

module.exports = startCronJobs;