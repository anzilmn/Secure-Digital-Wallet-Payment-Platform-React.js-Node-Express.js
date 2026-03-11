const mongoose = require('mongoose');
const s = new mongoose.Schema({
  merchant:    { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  orderId:     { type:String, required:true },
  amount:      { type:Number, required:true, min:1 },
  description: { type:String, default:'' },
  status:      { type:String, enum:['pending','paid','expired'], default:'pending' },
  paymentLink: { type:String, unique:true },
  paidBy:      { type:mongoose.Schema.Types.ObjectId, ref:'User', default:null },
  paidAt:      { type:Date, default:null },
  expiresAt:   { type:Date, default:()=>new Date(Date.now()+24*60*60*1000) },
  createdAt:   { type:Date, default:Date.now }
});
module.exports = mongoose.model('MerchantRequest', s);
