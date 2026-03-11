const mongoose = require('mongoose');
const s = new mongoose.Schema({
  userId:    { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  title:     { type:String, required:true },
  message:   { type:String, required:true },
  type:      { type:String, enum:['credit','debit','info','alert'], default:'info' },
  isRead:    { type:Boolean, default:false },
  createdAt: { type:Date, default:Date.now }
});
module.exports = mongoose.model('Notification', s);
