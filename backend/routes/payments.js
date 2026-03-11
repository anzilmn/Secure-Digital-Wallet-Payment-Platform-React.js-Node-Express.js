const express        = require('express');
const router         = express.Router();
const MerchantRequest= require('../models/MerchantRequest');
const Wallet         = require('../models/Wallet');
const Transaction    = require('../models/Transaction');
const Notification   = require('../models/Notification');
const { protect, merchantOnly } = require('../middleware/auth');
const { v4:uuidv4 }  = require('uuid');
const { generateTxnId } = require('../utils/txnId');
const { notifyUser } = require('../utils/socketNotify');

router.post('/create-request', protect, merchantOnly, async (req,res) => {
  try {
    const { amount, description } = req.body;
    if (!amount||amount<=0) return res.status(400).json({success:false,message:'Valid amount required'});
    const orderId = 'ORD'+uuidv4().slice(0,8).toUpperCase();
    const paymentLink = (req.user.merchantId||req.user._id.toString())+'/'+uuidv4().slice(0,12);
    const request = await MerchantRequest.create({merchant:req.user._id,orderId,amount,description:description||'',paymentLink});
    const populated = await MerchantRequest.findById(request._id).populate('merchant','name email');
    res.status(201).json({success:true,request:populated});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

router.get('/my-requests', protect, merchantOnly, async (req,res) => {
  const requests = await MerchantRequest.find({merchant:req.user._id}).populate('paidBy','name email').sort({createdAt:-1});
  res.json({success:true,requests});
});

router.get('/link/:link', async (req,res) => {
  const request = await MerchantRequest.findOne({paymentLink:req.params.link}).populate('merchant','name email');
  if (!request) return res.status(404).json({success:false,message:'Payment link not found'});
  res.json({success:true,request,alreadyPaid:request.status!=='pending'});
});

router.post('/pay/:requestId', protect, async (req,res) => {
  try {
    const request = await MerchantRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({success:false,message:'Not found'});
    if (request.status!=='pending') return res.status(400).json({success:false,message:'Already processed'});
    if (request.merchant.toString()===req.user._id.toString()) return res.status(400).json({success:false,message:'Cannot pay own request'});

    const wallet = await Wallet.findOne({userId:req.user._id});
    if (!wallet||wallet.balance<request.amount) return res.status(400).json({success:false,message:'Insufficient balance'});

    await Wallet.findOneAndUpdate({userId:req.user._id},{$inc:{balance:-request.amount,totalSent:request.amount}});
    await Wallet.findOneAndUpdate({userId:request.merchant},{$inc:{balance:request.amount,totalReceived:request.amount}});

    const txnId = generateTxnId();
    await Transaction.create({transactionId:txnId,sender:req.user._id,receiver:request.merchant,amount:request.amount,type:'payment',status:'completed',note:'Payment for '+request.orderId,paymentRequestId:request._id});
    await MerchantRequest.findByIdAndUpdate(request._id,{status:'paid',paidBy:req.user._id,paidAt:Date.now()});

    const sMsg=`₹${request.amount} paid for ${request.orderId}`, rMsg=`₹${request.amount} received for ${request.orderId}`;
    await Notification.create({userId:req.user._id,title:'Payment Sent',message:sMsg,type:'debit'});
    await Notification.create({userId:request.merchant,title:'Payment Received',message:rMsg,type:'credit'});
    notifyUser(req.user._id,'notification',{title:'Payment Sent',message:sMsg,type:'debit'});
    notifyUser(request.merchant,'notification',{title:'Payment Received',message:rMsg,type:'credit'});

    res.json({success:true,message:'Payment successful'});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

module.exports = router;
