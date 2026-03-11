const express     = require('express');
const router      = express.Router();
const Transaction = require('../models/Transaction');
const PDFDocument = require('pdfkit');
const { protect } = require('../middleware/auth');

router.get('/:txnId', protect, async (req,res) => {
  try {
    const txn = await Transaction.findOne({transactionId:req.params.txnId}).populate('sender receiver','name email');
    if (!txn) return res.status(404).json({success:false,message:'Transaction not found'});
    // Only sender or receiver can download
    const ids = [txn.sender._id.toString(), txn.receiver._id.toString()];
    if (!ids.includes(req.user._id.toString())) return res.status(403).json({success:false,message:'Forbidden'});

    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition',`attachment; filename="receipt-${txn.transactionId}.pdf"`);

    const doc = new PDFDocument({ size:'A5', margin:40 });
    doc.pipe(res);

    // Header
    doc.rect(0,0,doc.page.width,80).fill('#0A1628');
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text('PayFlow', 40, 25);
    doc.fontSize(11).font('Helvetica').text('Digital Payment Receipt', 40, 52);

    // Status badge
    doc.moveDown(2);
    doc.fillColor('#10B981').fontSize(28).font('Helvetica-Bold').text('✓ Payment Successful', {align:'center'});

    // Amount
    doc.moveDown(0.5);
    doc.fillColor('#0A1628').fontSize(38).font('Helvetica-Bold').text('₹'+Number(txn.amount).toLocaleString('en-IN'), {align:'center'});

    // Details box
    doc.moveDown(0.8);
    const bx=40, by=doc.y, bw=doc.page.width-80;
    doc.rect(bx,by,bw,160).fill('#F8FAFF').stroke('#E2E8F0');

    const rows=[
      ['Transaction ID', txn.transactionId],
      ['Date & Time',    new Date(txn.createdAt).toLocaleString('en-IN')],
      ['From',           txn.sender.name+' ('+txn.sender.email+')'],
      ['To',             txn.receiver.name+' ('+txn.receiver.email+')'],
      ['Type',           txn.type.toUpperCase()],
      ['Status',         txn.status.toUpperCase()],
    ];
    let ry=by+14;
    rows.forEach(([k,v])=>{
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748B').text(k, bx+16, ry);
      doc.fontSize(10).font('Helvetica').fillColor('#0A1628').text(v, bx+130, ry, {width:bw-146,ellipsis:true});
      ry+=23;
    });

    if (txn.note) {
      doc.moveDown(1.2);
      doc.fontSize(10).fillColor('#64748B').font('Helvetica-Bold').text('Note:');
      doc.fontSize(11).fillColor('#0A1628').font('Helvetica').text(txn.note);
    }

    // Footer
    doc.moveDown(1.5);
    doc.fontSize(9).fillColor('#94A3B8').font('Helvetica').text('This is an electronically generated receipt. No signature required.', {align:'center'});
    doc.text('PayFlow • Secure Digital Payments • payflow.app', {align:'center'});

    doc.end();
  } catch(e){ console.error(e); res.status(500).json({success:false,message:e.message}); }
});

module.exports = router;
