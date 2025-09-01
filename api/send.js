// api/send.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { token, from, to, subject, text } = req.body;
  if (!token || !from || !to || !text)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    // fetch Mail.tm messages endpoint
    const r = await fetch("https://api.mail.tm/messages", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        from: { address: from, name: "TempMail User" },
        to: [{ address: to }],
        subject,
        text
      })
    });

    // read response as text first
    const textResponse = await r.text();
    let data;

    try {
      data = JSON.parse(textResponse); // try parse JSON
    } catch (e) {
      console.error("Mail.tm returned non-JSON response:", textResponse);
      data = { error: textResponse }; // fallback JSON
    }

    res.status(200).json(data);

  } catch (e) {
    console.error("Error sending email:", e);
    res.status(500).json({ error: e.toString() });
  }
}
