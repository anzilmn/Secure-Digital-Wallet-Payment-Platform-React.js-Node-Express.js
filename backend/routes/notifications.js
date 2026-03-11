const express      = require('express');
const router       = express.Router();
const Notification = require('../models/Notification');
const { protect }  = require('../middleware/auth');

router.get('/', protect, async (req,res) => {
  const notifications = await Notification.find({userId:req.user._id}).sort({createdAt:-1}).limit(50);
  const unreadCount   = await Notification.countDocuments({userId:req.user._id,isRead:false});
  res.json({success:true,notifications,unreadCount});
});

router.put('/read-all', protect, async (req,res) => {
  await Notification.updateMany({userId:req.user._id,isRead:false},{isRead:true});
  res.json({success:true});
});

module.exports = router;
