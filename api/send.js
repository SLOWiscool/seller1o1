import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { from, password, to, subject, text } = req.body;

  if (!from || !password || !to || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Create SMTP transporter
    let transporter = nodemailer.createTransport({
      host: "smtp.mail.tm",
      port: 587,
      secure: false,
      auth: { user: from, pass: password },
    });

    // Send email
    let info = await transporter.sendMail({
      from,
      to,
      subject: subject || "(no subject)",
      text,
    });

    // Return success
    res.status(200).json({ success: true, messageId: info.messageId });

  } catch (err) {
    // Always return JSON with full error details
    res.status(500).json({ error: err.toString() });
  }
}
