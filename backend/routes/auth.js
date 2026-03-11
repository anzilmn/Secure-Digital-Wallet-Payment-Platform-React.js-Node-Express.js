const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const Wallet   = require('../models/Wallet');
const { protect } = require('../middleware/auth');
const { v4:uuidv4 } = require('uuid');
const email    = require('../utils/email');

const sign = id => jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:process.env.JWT_EXPIRE});

router.post('/register', async (req,res) => {
  try {
    const { name, email:em, password, phone, role } = req.body;
    if (!name||!em||!password) return res.status(400).json({success:false,message:'Name, email and password required'});
    if (password.length < 6)   return res.status(400).json({success:false,message:'Password min 6 chars'});
    if (await User.findOne({email:em})) return res.status(400).json({success:false,message:'Email already registered'});

    const d = { name, email:em, password, phone:phone||'' };
    if (role==='merchant') { d.role='merchant'; d.merchantId='MERCH_'+uuidv4().slice(0,8).toUpperCase(); }

    const user = await User.create(d);
    await Wallet.create({userId:user._id});
    const token = sign(user._id);
    res.status(201).json({success:true, token, user:{id:user._id,name:user.name,email:user.email,role:user.role,theme:user.theme}});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

router.post('/login', async (req,res) => {
  try {
    const { email:em, password } = req.body;
    if (!em||!password) return res.status(400).json({success:false,message:'Email and password required'});

    // Admin shortcut
    if (em==='admin' && password==='admin') {
      let admin = await User.findOne({role:'admin'});
      if (!admin) { admin=await User.create({name:'Admin',email:'admin@payflow.com',password:'admin123',role:'admin'}); await Wallet.create({userId:admin._id}); }
      return res.json({success:true, token:sign(admin._id), user:{id:admin._id,name:admin.name,email:admin.email,role:admin.role,theme:admin.theme}});
    }

    const user = await User.findOne({email:em});
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({success:false,message:'Invalid credentials'});
    if (user.isBlocked) return res.status(403).json({success:false,message:'Account blocked'});

    // Login alert email (non-blocking)
    email.sendLoginAlertEmail(user, req.ip).catch(()=>{});

    res.json({success:true, token:sign(user._id), user:{id:user._id,name:user.name,email:user.email,role:user.role,theme:user.theme}});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

router.get('/me', protect, async (req,res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({success:true,user});
});

router.put('/theme', protect, async (req,res) => {
  const { theme } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, {theme}, {new:true}).select('-password');
  res.json({success:true,user});
});

module.exports = router;
