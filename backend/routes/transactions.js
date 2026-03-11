const express      = require('express');
const router       = express.Router();
const Transaction  = require('../models/Transaction');
const Wallet       = require('../models/Wallet');
const User         = require('../models/User');
const Notification = require('../models/Notification');
const { protect }  = require('../middleware/auth');
const { generateTxnId } = require('../utils/txnId');
const { notifyUser }    = require('../utils/socketNotify');
const { checkFraud }    = require('../utils/fraud');
const email  = require('../utils/email');

router.post('/send', protect, async (req,res) => {
  try {
    const { receiverEmail, amount, note, otpConfirmed } = req.body;
    if (!receiverEmail||!amount) return res.status(400).json({success:false,message:'Receiver and amount required'});
    if (amount<=0) return res.status(400).json({success:false,message:'Amount must be > 0'});

    const receiver = await User.findOne({email:receiverEmail});
    if (!receiver) return res.status(404).json({success:false,message:'Receiver not found'});
    if (receiver._id.toString()===req.user._id.toString()) return res.status(400).json({success:false,message:'Cannot send to yourself'});

    // Fraud check
    const fraud = await checkFraud(req.user, amount);
    if (fraud.flagged && amount>=parseInt(process.env.FRAUD_LARGE_TXN_THRESHOLD||'50000') && !otpConfirmed)
      return res.status(400).json({success:false,message:'Large transaction requires OTP confirmation',requireOTP:true});

    const sWallet = await Wallet.findOne({userId:req.user._id});
    if (!sWallet||sWallet.balance<amount) return res.status(400).json({success:false,message:'Insufficient balance'});

    await Wallet.findOneAndUpdate({userId:req.user._id},{$inc:{balance:-amount,totalSent:amount},updatedAt:Date.now()});
    await Wallet.findOneAndUpdate({userId:receiver._id},{$inc:{balance:amount,totalReceived:amount},updatedAt:Date.now()});

    const txnId = generateTxnId();
    const txn   = await Transaction.create({transactionId:txnId,sender:req.user._id,receiver:receiver._id,amount,type:'transfer',status:'completed',note:note||''});

    // Notifications
    const sMsg=`₹${amount} sent to ${receiver.name}`, rMsg=`₹${amount} received from ${req.user.name}`;
    await Notification.create({userId:req.user._id,title:'Money Sent',message:sMsg,type:'debit'});
    await Notification.create({userId:receiver._id,title:'Money Received',message:rMsg,type:'credit'});
    notifyUser(req.user._id,'notification',{title:'Money Sent',message:sMsg,type:'debit'});
    notifyUser(receiver._id,'notification',{title:'Money Received',message:rMsg,type:'credit'});

    // Emails (non-blocking)
    email.sendPaymentSentEmail(req.user, amount, receiver, txnId).catch(()=>{});
    email.sendPaymentReceivedEmail(receiver, amount, req.user, txnId).catch(()=>{});

    const populated = await Transaction.findById(txn._id).populate('sender receiver','name email avatar');
    res.json({success:true,transaction:populated});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

// Advanced search + filter
router.get('/', protect, async (req,res) => {
  try {
    const { type, status, search, dateFrom, dateTo, amountMin, amountMax, page=1, limit=20 } = req.query;

    let base = { $or:[{sender:req.user._id},{receiver:req.user._id}] };
    if (type==='sent')     base = { sender:req.user._id,   type:{$ne:'topup'} };
    if (type==='received') base = { receiver:req.user._id, type:{$ne:'withdrawal'} };

    const extra = {};
    if (status)    extra.status = status;
    if (amountMin||amountMax) extra.amount = {};
    if (amountMin) extra.amount.$gte = parseFloat(amountMin);
    if (amountMax) extra.amount.$lte = parseFloat(amountMax);
    if (dateFrom||dateTo) extra.createdAt = {};
    if (dateFrom)  extra.createdAt.$gte = new Date(dateFrom);
    if (dateTo)    extra.createdAt.$lte = new Date(dateTo);
    if (search)    extra.transactionId  = new RegExp(search,'i');

    const query = { ...base, ...extra };
    const [transactions, total] = await Promise.all([
      Transaction.find(query).populate('sender receiver','name email avatar').sort({createdAt:-1}).skip((page-1)*limit).limit(parseInt(limit)),
      Transaction.countDocuments(query)
    ]);
    res.json({success:true,transactions,total,pages:Math.ceil(total/limit)});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

router.get('/:id', protect, async (req,res) => {
  const txn = await Transaction.findById(req.params.id).populate('sender receiver','name email avatar');
  if (!txn) return res.status(404).json({success:false,message:'Not found'});
  res.json({success:true,transaction:txn});
});

module.exports = router;
