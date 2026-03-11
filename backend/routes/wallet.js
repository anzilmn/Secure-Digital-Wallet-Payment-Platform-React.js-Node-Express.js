const express      = require('express');
const router       = express.Router();
const Wallet       = require('../models/Wallet');
const Transaction  = require('../models/Transaction');
const Notification = require('../models/Notification');
const { protect }  = require('../middleware/auth');
const { generateTxnId } = require('../utils/txnId');
const { notifyUser }    = require('../utils/socketNotify');

router.get('/', protect, async (req,res) => {
  const wallet = await Wallet.findOne({userId:req.user._id});
  if (!wallet) return res.status(404).json({success:false,message:'Wallet not found'});
  res.json({success:true,wallet});
});

router.post('/add-money', protect, async (req,res) => {
  try {
    const { amount } = req.body;
    if (!amount||amount<=0) return res.status(400).json({success:false,message:'Invalid amount'});
    const wallet = await Wallet.findOneAndUpdate({userId:req.user._id},{$inc:{balance:amount,totalReceived:amount},updatedAt:Date.now()},{new:true});
    const txnId  = generateTxnId();
    await Transaction.create({transactionId:txnId,sender:req.user._id,receiver:req.user._id,amount,type:'topup',status:'completed',note:'Wallet top-up'});
    const msg = `₹${amount} added to wallet`;
    await Notification.create({userId:req.user._id,title:'Money Added',message:msg,type:'credit'});
    notifyUser(req.user._id,'notification',{title:'Money Added',message:msg,type:'credit'});
    res.json({success:true,wallet});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

router.post('/withdraw', protect, async (req,res) => {
  try {
    const { amount } = req.body;
    if (!amount||amount<=0) return res.status(400).json({success:false,message:'Invalid amount'});
    const wallet = await Wallet.findOne({userId:req.user._id});
    if (!wallet||wallet.balance<amount) return res.status(400).json({success:false,message:'Insufficient balance'});
    await Wallet.findOneAndUpdate({userId:req.user._id},{$inc:{balance:-amount,totalSent:amount},updatedAt:Date.now()});
    const txnId = generateTxnId();
    await Transaction.create({transactionId:txnId,sender:req.user._id,receiver:req.user._id,amount,type:'withdrawal',status:'completed',note:'Withdrawal'});
    const msg = `₹${amount} withdrawn`;
    await Notification.create({userId:req.user._id,title:'Withdrawal',message:msg,type:'debit'});
    notifyUser(req.user._id,'notification',{title:'Withdrawal',message:msg,type:'debit'});
    const updated = await Wallet.findOne({userId:req.user._id});
    res.json({success:true,wallet:updated});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

module.exports = router;
