# 💸 PayFlow v2 — Advanced Digital Payment Platform

> Full-stack payment platform · React · Node.js · Express · MongoDB · Socket.io

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16 · MongoDB running on port 27017

```bash
# Start MongoDB
mongod

# Backend  (Terminal 1)
cd backend && npm install && npm run dev

# Frontend (Terminal 2)
cd frontend && npm install && npm start
```

Open **http://localhost:3000**

## 🔐 Admin Login
> username = `admin` · password = `admin`

## ✨ All Features

| Feature | Status |
|---------|--------|
| Wallet (Add/Withdraw) | ✅ |
| P2P Send / Receive | ✅ |
| QR Code Payments (generate + scan) | ✅ |
| Payment Request System (request/accept/decline) | ✅ |
| Advanced Filters (date, amount, type, status) | ✅ |
| Real-Time Notifications (Socket.io) | ✅ |
| Email Notifications (Nodemailer) | ✅ |
| Analytics Dashboard (Line/Bar/Pie charts) | ✅ |
| Fraud Detection (rate-limit + large-txn alerts) | ✅ |
| 2FA OTP for Large Transfers | ✅ |
| PDF Payment Receipts | ✅ |
| Unique TXN-YYYY-XXXXXX ID System | ✅ |
| Scheduled Payments (node-cron) | ✅ |
| Dark / Light Mode | ✅ |
| Merchant Payment Links | ✅ |
| Admin Dashboard (block/unblock users) | ✅ |

## 🔧 Tech Stack
React 18 · React Router v6 · Recharts · Socket.io Client · QRCode.react · QR-Scanner
Node.js · Express · MongoDB · Mongoose · Socket.io · node-cron · PDFKit · Speakeasy · QRCode · Nodemailer · JWT · Bcrypt
