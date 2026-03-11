const ScheduledPayment = require('../models/ScheduledPayment');
const Wallet           = require('../models/Wallet');
const Transaction      = require('../models/Transaction');
const Notification     = require('../models/Notification');
const User             = require('../models/User');
const email            = require('../utils/email');
const { generateTxnId } = require('../utils/txnId');
const { notifyUser }   = require('../utils/socketNotify');

exports.processScheduledPayments = async () => {
  try {
    const due = await ScheduledPayment.find({
      status: 'pending',
      scheduledAt: { $lte: new Date() }
    }).populate('sender receiver');

    for (const sp of due) {
      try {
        const sWallet = await Wallet.findOne({ userId: sp.sender._id });
        if (!sWallet || sWallet.balance < sp.amount) {
          await ScheduledPayment.findByIdAndUpdate(sp._id, { status: 'failed', failReason: 'Insufficient balance' });
          continue;
        }

        await Wallet.findOneAndUpdate({ userId: sp.sender._id }, { $inc: { balance: -sp.amount, totalSent: sp.amount } });
        await Wallet.findOneAndUpdate({ userId: sp.receiver._id }, { $inc: { balance: sp.amount, totalReceived: sp.amount } });

        const txnId = generateTxnId();
        await Transaction.create({
          transactionId: txnId,
          sender: sp.sender._id, receiver: sp.receiver._id,
          amount: sp.amount, type: 'scheduled', status: 'completed',
          note: sp.note || 'Scheduled payment'
        });

        await ScheduledPayment.findByIdAndUpdate(sp._id, { status: 'completed' });

        const msg = `Scheduled ₹${sp.amount} sent to ${sp.receiver.name}`;
        await Notification.create({ userId: sp.sender._id, title: 'Scheduled Payment Sent', message: msg, type: 'debit' });
        notifyUser(sp.sender._id, 'notification', { title: 'Scheduled Payment Sent', message: msg, type: 'debit' });

        await email.sendScheduledPaymentEmail(sp.sender, sp.amount, sp.receiver);
      } catch (e) {
        console.error('Scheduler error:', e.message);
      }
    }
  } catch (e) {
    console.error('Scheduler run error:', e.message);
  }
};
