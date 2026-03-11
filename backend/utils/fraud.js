const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const email = require('./email');

const LARGE_TXN = parseInt(process.env.FRAUD_LARGE_TXN_THRESHOLD || '50000');
const MAX_PER_MIN = parseInt(process.env.FRAUD_MAX_TXN_PER_MINUTE || '5');

exports.checkFraud = async (user, amount) => {
  const alerts = [];

  // 1. Large transaction alert
  if (amount >= LARGE_TXN) {
    alerts.push('Large transaction: ₹' + amount);
  }

  // 2. Too many transactions in 1 minute
  const oneMinAgo = new Date(Date.now() - 60 * 1000);
  const recent = await Transaction.countDocuments({ sender: user._id, createdAt: { $gte: oneMinAgo } });
  if (recent >= MAX_PER_MIN) {
    alerts.push('Too many transactions in 1 minute (' + recent + ')');
  }

  if (alerts.length > 0) {
    const reason = alerts.join('; ');
    await Notification.create({ userId: user._id, title: '⚠️ Fraud Alert', message: reason, type: 'alert' });
    await email.sendFraudAlertEmail(user, reason);
    // Emit real-time alert
    if (global.io && global.connectedUsers[user._id.toString()]) {
      global.io.to(global.connectedUsers[user._id.toString()]).emit('fraud_alert', { message: reason });
    }
    return { flagged: true, reason };
  }
  return { flagged: false };
};
