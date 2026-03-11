const mongoose = require('mongoose');
const walletSchema = new mongoose.Schema({
  userId:        { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true, unique:true },
  balance:       { type:Number, default:0, min:0 },
  totalSent:     { type:Number, default:0 },
  totalReceived: { type:Number, default:0 },
  currency:      { type:String, default:'INR' },
  updatedAt:     { type:Date, default:Date.now }
});
module.exports = mongoose.model('Wallet', walletSchema);
