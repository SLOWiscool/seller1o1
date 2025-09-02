// send.js
// Node.js backend for /api/send
// Uses SMTP to send Mail.tm emails using user's JWT as password

import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';

const app = express();
app.use(bodyParser.json());

app.post('/api/send', async (req, res) => {
  try {
    const { from, password, to, subject, text } = req.body;

    if (!from || !password || !to || !subject || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Mail.tm SMTP settings
    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.tm',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: from,
        pass: password, // JWT token
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });

    return res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('Send error:', err);
    return res.status(500).json({ error: 'Failed to send email', details: err.toString() });
  }
});

// For Vercel serverless function export
export default app;
