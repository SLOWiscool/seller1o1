// send.js — Node.js backend for sending email via Mail.tm SMTP
const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// POST /api/send
// Body: { from, password, to, subject, text }
app.post('/api/send', async (req, res) => {
  const { from, password, to, subject, text } = req.body;

  if(!from || !password || !to || !subject || !text){
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try{
    // Mail.tm SMTP setup
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.tm',
      port: 587,
      secure: false,
      auth: {
        user: from,
        pass: password  // Mail.tm token
      }
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text
    });

    res.json({ success: true, messageId: info.messageId });
  }catch(e){
    console.error('Send error:', e);
    res.status(500).json({ success:false, error: e.message });
  }
});

// start server (e.g., on Vercel you might export as a function)
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`send.js running on port ${PORT}`));
