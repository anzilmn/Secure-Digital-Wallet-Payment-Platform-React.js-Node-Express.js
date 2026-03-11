const express     = require('express');
const router      = express.Router();
const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const Wallet      = require('../models/Wallet');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', async (_,res) => {
  try {
    const [totalUsers,totalMerchants,totalTransactions,wallets,volumeAgg,recentTxns,recentUsers] = await Promise.all([
      User.countDocuments({role:{$ne:'admin'}}),
      User.countDocuments({role:'merchant'}),
      Transaction.countDocuments(),
      Wallet.aggregate([{$group:{_id:null,total:{$sum:'$balance'}}}]),
      Transaction.aggregate([{$group:{_id:null,total:{$sum:'$amount'}}}]),
      Transaction.find().populate('sender receiver','name email').sort({createdAt:-1}).limit(10),
      User.find({role:{$ne:'admin'}}).sort({createdAt:-1}).limit(5).select('-password')
    ]);
    res.json({success:true,stats:{totalUsers,totalMerchants,totalTransactions,totalVolume:volumeAgg[0]?.total||0,totalWalletBalance:wallets[0]?.total||0},recentTransactions:recentTxns,recentUsers});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

router.get('/users', async (req,res) => {
  const { page=1, limit=20, search='' } = req.query;
  const q = search ? {$or:[{name:new RegExp(search,'i')},{email:new RegExp(search,'i')}]} : {};
  const [users,total] = await Promise.all([
    User.find({...q,role:{$ne:'admin'}}).select('-password').sort({createdAt:-1}).skip((page-1)*limit).limit(parseInt(limit)),
    User.countDocuments({...q,role:{$ne:'admin'}})
  ]);
  res.json({success:true,users,total});
});

router.get('/transactions', async (req,res) => {
  const { page=1, limit=20 } = req.query;
  const [transactions,total] = await Promise.all([
    Transaction.find().populate('sender receiver','name email').sort({createdAt:-1}).skip((page-1)*limit).limit(parseInt(limit)),
    Transaction.countDocuments()
  ]);
  res.json({success:true,transactions,total});
});

router.put('/users/:id/block',   async (req,res) => { const u=await User.findByIdAndUpdate(req.params.id,{isBlocked:true},{new:true}).select('-password'); res.json({success:true,user:u}); });
router.put('/users/:id/unblock', async (req,res) => { const u=await User.findByIdAndUpdate(req.params.id,{isBlocked:false},{new:true}).select('-password'); res.json({success:true,user:u}); });

module.exports = router;
