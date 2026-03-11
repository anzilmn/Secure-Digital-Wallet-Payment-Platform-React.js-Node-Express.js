const express       = require('express');
const router        = express.Router();
const MoneyRequest  = require('../models/MoneyRequest');
const Wallet        = require('../models/Wallet');
const Transaction   = require('../models/Transaction');
const Notification  = require('../models/Notification');
const User          = require('../models/User');
const { protect }   = require('../middleware/auth');
const { generateTxnId } = require('../utils/txnId');
const { notifyUser } = require('../utils/socketNotify');

// Create a money request
router.post('/create', protect, async (req,res) => {
  try {
    const { payerEmail, amount, note } = req.body;
    if (!payerEmail||!amount||amount<=0) return res.status(400).json({success:false,message:'Payer email and amount required'});
    const payer = await User.findOne({email:payerEmail});
    if (!payer) return res.status(404).json({success:false,message:'User not found'});
    if (payer._id.toString()===req.user._id.toString()) return res.status(400).json({success:false,message:'Cannot request from yourself'});

    const request = await MoneyRequest.create({requester:req.user._id,payer:payer._id,amount,note:note||''});
    const msg = `${req.user.name} requested ₹${amount} from you`;
    await Notification.create({userId:payer._id,title:'Money Request',message:msg,type:'info'});
    notifyUser(payer._id,'money_request',{title:'Money Request',message:msg,requestId:request._id});

    res.status(201).json({success:true,request});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

// My incoming requests (I need to pay)
router.get('/incoming', protect, async (req,res) => {
  const requests = await MoneyRequest.find({payer:req.user._id,status:'pending'}).populate('requester','name email avatar').sort({createdAt:-1});
  res.json({success:true,requests});
});

// My outgoing requests (I requested)
router.get('/outgoing', protect, async (req,res) => {
  const requests = await MoneyRequest.find({requester:req.user._id}).populate('payer','name email avatar').sort({createdAt:-1});
  res.json({success:true,requests});
});

// Accept (pay) a money request
router.post('/:id/accept', protect, async (req,res) => {
  try {
    const request = await MoneyRequest.findById(req.params.id).populate('requester payer');
    if (!request) return res.status(404).json({success:false,message:'Not found'});
    if (request.payer._id.toString()!==req.user._id.toString()) return res.status(403).json({success:false,message:'Not your request'});
    if (request.status!=='pending') return res.status(400).json({success:false,message:'Already processed'});

    const wallet = await Wallet.findOne({userId:req.user._id});
    if (!wallet||wallet.balance<request.amount) return res.status(400).json({success:false,message:'Insufficient balance'});

    await Wallet.findOneAndUpdate({userId:req.user._id},{$inc:{balance:-request.amount,totalSent:request.amount}});
    await Wallet.findOneAndUpdate({userId:request.requester._id},{$inc:{balance:request.amount,totalReceived:request.amount}});

    const txnId = generateTxnId();
    await Transaction.create({transactionId:txnId,sender:req.user._id,receiver:request.requester._id,amount:request.amount,type:'transfer',status:'completed',note:'Money request accepted'});
    await MoneyRequest.findByIdAndUpdate(request._id,{status:'paid'});

    const sMsg=`₹${request.amount} sent to ${request.requester.name}`;
    const rMsg=`₹${request.amount} received from ${req.user.name} (request)`;
    await Notification.create({userId:req.user._id,title:'Request Paid',message:sMsg,type:'debit'});
    await Notification.create({userId:request.requester._id,title:'Request Fulfilled',message:rMsg,type:'credit'});
    notifyUser(req.user._id,'notification',{title:'Request Paid',message:sMsg,type:'debit'});
    notifyUser(request.requester._id,'notification',{title:'Request Fulfilled',message:rMsg,type:'credit'});

    res.json({success:true,message:'Payment sent'});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

// Decline
router.post('/:id/decline', protect, async (req,res) => {
  try {
    const request = await MoneyRequest.findById(req.params.id).populate('requester');
    if (!request||request.payer.toString()!==req.user._id.toString()) return res.status(403).json({success:false,message:'Not your request'});
    await MoneyRequest.findByIdAndUpdate(request._id,{status:'declined'});
    await Notification.create({userId:request.requester._id,title:'Request Declined',message:`${req.user.name} declined your ₹${request.amount} request`,type:'info'});
    notifyUser(request.requester._id,'notification',{title:'Request Declined',message:`Your request was declined`,type:'info'});
    res.json({success:true,message:'Request declined'});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

module.exports = router;
