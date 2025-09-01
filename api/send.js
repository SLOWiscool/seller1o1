import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, from, to, subject, text } = req.body;
  if (!token || !from || !to || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await fetch("https://api.mail.tm/messages", {
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

    // Read raw text first
    const rawResponse = await response.text();

    // Try parsing JSON safely
    try {
      const data = JSON.parse(rawResponse);
      res.status(200).json(data);
    } catch (err) {
      // Mail.tm returned HTML or invalid JSON
      res.status(500).json({ error: "Mail.tm returned non-JSON response", raw: rawResponse });
    }

  } catch (err) {
    res.status(500).json({ error: "Fetch failed", details: err.toString() });
  }
}
