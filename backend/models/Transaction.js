const mongoose = require('mongoose');
const txnSchema = new mongoose.Schema({
  transactionId: { type:String, unique:true, required:true },
  sender:   { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  receiver: { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  amount:   { type:Number, required:true, min:1 },
  type:     { type:String, enum:['transfer','payment','topup','withdrawal','scheduled','refund'], default:'transfer' },
  status:   { type:String, enum:['pending','completed','failed'], default:'completed' },
  note:     { type:String, default:'' },
  paymentRequestId: { type:mongoose.Schema.Types.ObjectId, ref:'MerchantRequest', default:null },
  createdAt:{ type:Date, default:Date.now }
});
txnSchema.index({ sender:1, createdAt:-1 });
txnSchema.index({ receiver:1, createdAt:-1 });
module.exports = mongoose.model('Transaction', txnSchema);
