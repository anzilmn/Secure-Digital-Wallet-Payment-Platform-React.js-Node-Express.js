const express = require('express');
const router  = express.Router();
const QRCode  = require('qrcode');
const { protect } = require('../middleware/auth');

// Generate QR for receiving money
router.get('/generate', protect, async (req,res) => {
  try {
    const { amount } = req.query;
    const payload = JSON.stringify({ userId:req.user._id, email:req.user.email, name:req.user.name, amount:amount||null });
    const qr = await QRCode.toDataURL(payload, { width:300, margin:2, color:{dark:'#0A1628',light:'#FFFFFF'} });
    res.json({success:true,qr,payload});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

module.exports = router;
