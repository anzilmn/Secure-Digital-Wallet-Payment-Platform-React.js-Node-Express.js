const mongoose = require('mongoose');
const s = new mongoose.Schema({
  sender:      { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  receiver:    { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  amount:      { type:Number, required:true, min:1 },
  note:        { type:String, default:'' },
  scheduledAt: { type:Date, required:true },
  status:      { type:String, enum:['pending','completed','failed','cancelled'], default:'pending' },
  failReason:  { type:String, default:'' },
  createdAt:   { type:Date, default:Date.now }
});
module.exports = mongoose.model('ScheduledPayment', s);
