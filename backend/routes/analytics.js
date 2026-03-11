const express     = require('express');
const router      = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

router.get('/overview', protect, async (req,res) => {
  try {
    const userId = req.user._id;
    const now    = new Date();
    const days   = [];

    // Last 30 days daily breakdown
    for (let i=29; i>=0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate()-i);
      const start = new Date(d.setHours(0,0,0,0));
      const end   = new Date(d.setHours(23,59,59,999));

      const [sent,recv] = await Promise.all([
        Transaction.aggregate([{$match:{sender:userId,type:{$ne:'topup'},status:'completed',createdAt:{$gte:start,$lte:end}}},{$group:{_id:null,total:{$sum:'$amount'}}}]),
        Transaction.aggregate([{$match:{receiver:userId,type:{$ne:'withdrawal'},status:'completed',createdAt:{$gte:start,$lte:end}}},{$group:{_id:null,total:{$sum:'$amount'}}}])
      ]);

      days.push({ date: start.toISOString().slice(0,10), sent: sent[0]?.total||0, received: recv[0]?.total||0 });
    }

    // Monthly totals (last 6 months)
    const monthly = [];
    for (let i=5; i>=0; i--) {
      const d  = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const end= new Date(now.getFullYear(), now.getMonth()-i+1, 0, 23, 59, 59);
      const [sent,recv] = await Promise.all([
        Transaction.aggregate([{$match:{sender:userId,type:{$ne:'topup'},status:'completed',createdAt:{$gte:d,$lte:end}}},{$group:{_id:null,total:{$sum:'$amount'},count:{$sum:1}}}]),
        Transaction.aggregate([{$match:{receiver:userId,type:{$ne:'withdrawal'},status:'completed',createdAt:{$gte:d,$lte:end}}},{$group:{_id:null,total:{$sum:'$amount'},count:{$sum:1}}}])
      ]);
      monthly.push({ month:d.toLocaleString('en',{month:'short'})+' '+d.getFullYear(), sent:sent[0]?.total||0, received:recv[0]?.total||0, sentCount:sent[0]?.count||0, receivedCount:recv[0]?.count||0 });
    }

    // Type breakdown
    const typeBreakdown = await Transaction.aggregate([
      {$match:{$or:[{sender:userId},{receiver:userId}]}},
      {$group:{_id:'$type',count:{$sum:1},total:{$sum:'$amount'}}}
    ]);

    res.json({success:true, daily:days, monthly, typeBreakdown});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
});

module.exports = router;
