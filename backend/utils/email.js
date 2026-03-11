const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST   || 'smtp.mailtrap.io',
  port:   parseInt(process.env.EMAIL_PORT || '587'),
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

const send = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM || 'noreply@payflow.app', to, subject, html });
    console.log('📧 Email sent to', to);
  } catch (e) {
    console.error('📧 Email failed:', e.message);
  }
};

exports.sendPaymentSentEmail = (user, amount, receiver, txnId) =>
  send({
    to: user.email,
    subject: 'Payment Sent – PayFlow',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8faff;border-radius:16px">
      <h2 style="color:#0A1628">💸 Payment Sent</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>You successfully sent <strong>₹${amount}</strong> to <strong>${receiver.name}</strong>.</p>
      <div style="background:#fff;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e2e8f0">
        <p><b>Transaction ID:</b> <code>${txnId}</code></p>
        <p><b>Amount:</b> ₹${amount}</p>
        <p><b>To:</b> ${receiver.name} (${receiver.email})</p>
        <p><b>Status:</b> ✅ Completed</p>
      </div>
      <p style="color:#64748b;font-size:13px">If you did not initiate this, contact support immediately.</p>
    </div>`
  });

exports.sendPaymentReceivedEmail = (user, amount, sender, txnId) =>
  send({
    to: user.email,
    subject: 'Payment Received – PayFlow',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8faff;border-radius:16px">
      <h2 style="color:#10B981">💰 Payment Received</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>You received <strong>₹${amount}</strong> from <strong>${sender.name}</strong>.</p>
      <div style="background:#fff;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e2e8f0">
        <p><b>Transaction ID:</b> <code>${txnId}</code></p>
        <p><b>Amount:</b> ₹${amount}</p>
        <p><b>From:</b> ${sender.name} (${sender.email})</p>
        <p><b>Status:</b> ✅ Completed</p>
      </div>
    </div>`
  });

exports.sendLoginAlertEmail = (user, ip) =>
  send({
    to: user.email,
    subject: 'New Login Detected – PayFlow',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff8f0;border-radius:16px">
      <h2 style="color:#F59E0B">🔐 New Login</h2>
      <p>Hi <strong>${user.name}</strong>, a new login was detected on your PayFlow account.</p>
      <p><b>IP:</b> ${ip || 'Unknown'} &nbsp; <b>Time:</b> ${new Date().toLocaleString()}</p>
      <p style="color:#64748b;font-size:13px">If this wasn't you, reset your password immediately.</p>
    </div>`
  });

exports.sendFraudAlertEmail = (user, reason) =>
  send({
    to: user.email,
    subject: '⚠️ Suspicious Activity Detected – PayFlow',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff1f1;border-radius:16px">
      <h2 style="color:#EF4444">⚠️ Fraud Alert</h2>
      <p>Hi <strong>${user.name}</strong>, suspicious activity was detected on your account.</p>
      <p><b>Reason:</b> ${reason}</p>
      <p>Your account has been temporarily flagged. Contact support if needed.</p>
    </div>`
  });

exports.sendScheduledPaymentEmail = (user, amount, receiver) =>
  send({
    to: user.email,
    subject: 'Scheduled Payment Executed – PayFlow',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8faff;border-radius:16px">
      <h2 style="color:#1E4FD8">⏰ Scheduled Payment Sent</h2>
      <p>Your scheduled payment of <strong>₹${amount}</strong> to <strong>${receiver.name}</strong> was executed successfully.</p>
    </div>`
  });
