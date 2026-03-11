const mongoose = require('mongoose');
const s = new mongoose.Schema({
  requester: { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  payer:     { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  amount:    { type:Number, required:true, min:1 },
  note:      { type:String, default:'' },
  status:    { type:String, enum:['pending','paid','declined'], default:'pending' },
  createdAt: { type:Date, default:Date.now }
});
module.exports = mongoose.model('MoneyRequest', s);
