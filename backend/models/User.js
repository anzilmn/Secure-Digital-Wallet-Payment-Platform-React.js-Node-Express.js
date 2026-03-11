const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:        { type:String, required:true, trim:true },
  email:       { type:String, required:true, unique:true, lowercase:true },
  password:    { type:String, required:true, minlength:6 },
  phone:       { type:String, default:'' },
  role:        { type:String, enum:['user','merchant','admin'], default:'user' },
  avatar:      { type:String, default:'' },
  isVerified:  { type:Boolean, default:false },
  isBlocked:   { type:Boolean, default:false },
  isFlagged:   { type:Boolean, default:false },
  merchantId:  { type:String, unique:true, sparse:true },
  twoFASecret: { type:String, default:'' },
  twoFAEnabled:{ type:Boolean, default:false },
  theme:       { type:String, enum:['light','dark'], default:'light' },
  createdAt:   { type:Date, default:Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function(p) { return bcrypt.compare(p, this.password); };

module.exports = mongoose.model('User', userSchema);
