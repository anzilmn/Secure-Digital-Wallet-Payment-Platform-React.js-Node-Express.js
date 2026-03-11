const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const http       = require('http');
const { Server } = require('socket.io');
const cron       = require('node-cron');

dotenv.config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: 'http://localhost:3000', credentials: true }
});

// Export io for use in routes
global.io = io;
global.connectedUsers = {}; // userId → socketId

io.on('connection', socket => {
  socket.on('register', userId => {
    global.connectedUsers[userId] = socket.id;
    console.log('🔌 User connected:', userId);
  });
  socket.on('disconnect', () => {
    for (const [uid, sid] of Object.entries(global.connectedUsers)) {
      if (sid === socket.id) { delete global.connectedUsers[uid]; break; }
    }
  });
});

const globalLimiter = rateLimit({ windowMs: 15*60*1000, max: 200 });
app.use(globalLimiter);
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/wallet',        require('./routes/wallet'));
app.use('/api/transactions',  require('./routes/transactions'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/qr',            require('./routes/qr'));
app.use('/api/requests',      require('./routes/paymentRequests'));
app.use('/api/analytics',     require('./routes/analytics'));
app.use('/api/scheduled',     require('./routes/scheduled'));
app.use('/api/receipts',      require('./routes/receipts'));

app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: 'PayFlow v2 API Running', features: ['QR','2FA','Analytics','Fraud','Scheduled','Receipts'] })
);

// ── Scheduled payments cron (runs every minute) ──
const { processScheduledPayments } = require('./services/schedulerService');
cron.schedule('* * * * *', processScheduledPayments);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 PayFlow v2 Server on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => { console.error('❌ DB Error:', err.message); process.exit(1); });

module.exports = { app, io };
