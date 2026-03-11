const express          = require('express');
const router           = express.Router();
const ScheduledPayment = require('../models/ScheduledPayment');
const User             = require('../models/User');
const { protect }      = require('../middleware/auth');

router.post('/create', protect, async (req,res) => {
  try {
    const { receiverEmail, amount, note, scheduledAt } = req.body;
    if (!receiverEmail||!amount||!scheduledAt) return res.status(400).json({success:false,message:'All fields required'});
    if (amount<=0) return res.status(400).json({success:false,message:'Amount must be > 0'});
    const receiver = await User.findOne({email:receiverEmail});
    if (!receiver) return res.status(404).json({success:false,message:'Receiver not found'});
    if (new Date(scheduledAt)<=new Date()) return res.status(400).json({success:false,message:'Scheduled time must be in the future'});
    const sp = await ScheduledPayment.create({sender:req.user._id,receiver:receiver._id,amount,note:note||'',scheduledAt:new Date(scheduledAt)});
    res.status(201).json({success:true,payment:sp});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

router.get('/my', protect, async (req,res) => {
  const payments = await ScheduledPayment.find({sender:req.user._id}).populate('receiver','name email').sort({scheduledAt:1});
  res.json({success:true,payments});
});

router.delete('/:id', protect, async (req,res) => {
  const sp = await ScheduledPayment.findOne({_id:req.params.id,sender:req.user._id,status:'pending'});
  if (!sp) return res.status(404).json({success:false,message:'Not found or not cancellable'});
  await ScheduledPayment.findByIdAndUpdate(req.params.id,{status:'cancelled'});
  res.json({success:true,message:'Cancelled'});
});

module.exports = router;
