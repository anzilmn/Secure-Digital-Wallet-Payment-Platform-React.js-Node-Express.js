const counter = { val: 0 };
// In production use a DB sequence. For now auto-increment per session.
exports.generateTxnId = () => {
  counter.val++;
  const year  = new Date().getFullYear();
  const seq   = String(counter.val).padStart(6,'0');
  return `TXN-${year}-${seq}`;
};
