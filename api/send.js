// /api/send.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { from, password, to, subject, text } = req.body;

  if (!from || !password || !to || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Configure SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.mail.tm",      // Mail.tm SMTP host
      port: 587,                 // SMTP port
      secure: false,             // true for 465, false for 587
      auth: { user: from, pass: password }
    });

    // Send email
    let info = await transporter.sendMail({
      from, 
      to, 
      subject: subject || "(no subject)",
      text
    });

    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    // Return full error
    res.status(500).json({ error: err.toString() });
  }
}
