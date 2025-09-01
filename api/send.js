import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { token, from, to, subject, text } = req.body;
  if (!token || !from || !to || !text) 
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const r = await fetch("https://api.mail.tm/messages", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        from: { address: from, name: "TempMail User" },
        to: [{ address: to }],
        subject: subject || "(no subject)",
        text
      })
    });

    const textResp = await r.text();
    try {
      const data = JSON.parse(textResp);
      return res.status(200).json(data);
    } catch (e) {
      // If not JSON, return raw text for debugging
      return res.status(r.status).json({ error: "Mail.tm did not return JSON", raw: textResp });
    }

  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
