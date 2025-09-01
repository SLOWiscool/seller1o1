import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { token, from, to, subject, text } = req.body;
  if (!token || !from || !to || !text) 
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const response = await fetch("https://api.mail.tm/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: { address: from },
        to: { address: to },
        subject: subject || "(no subject)",
        text
      })
    });

    const raw = await response.text();

    try {
      const data = JSON.parse(raw);
      if (response.ok) return res.status(200).json(data);
      return res.status(response.status).json({ error: data });
    } catch (e) {
      // Mail.tm returned HTML or invalid JSON
      return res.status(response.status).json({ error: "Mail.tm returned non-JSON response", raw });
    }

  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
}
