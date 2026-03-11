const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const storage = multer.diskStorage({
  destination:(_,__,cb)=>{ const d=path.join(__dirname,'../uploads/avatars'); fs.mkdirSync(d,{recursive:true}); cb(null,d); },
  filename:(req,f,cb)=>cb(null,req.user._id+'_'+Date.now()+path.extname(f.originalname))
});
const upload = multer({storage,limits:{fileSize:2*1024*1024}});

router.put('/profile', protect, async (req,res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id,{name,phone},{new:true}).select('-password');
  res.json({success:true,user});
});

router.post('/avatar', protect, upload.single('avatar'), async (req,res) => {
  if (!req.file) return res.status(400).json({success:false,message:'No file'});
  const avatarUrl='/uploads/avatars/'+req.file.filename;
  const user=await User.findByIdAndUpdate(req.user._id,{avatar:avatarUrl},{new:true}).select('-password');
  res.json({success:true,user});
});

router.get('/search', protect, async (req,res) => {
  const { q } = req.query;
  if (!q) return res.json({success:true,users:[]});
  const users=await User.find({
    $and:[{_id:{$ne:req.user._id}},{$or:[{email:new RegExp(q,'i')},{name:new RegExp(q,'i')}]}]
  }).select('name email avatar role').limit(10);
  res.json({success:true,users});
});

module.exports = router;
