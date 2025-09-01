import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { token, from, to, subject, text } = req.body;
  if (!token || !from || !to || !text) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

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

    const raw = await response.text(); // read as text first

    try {
      const data = JSON.parse(raw); // try parsing JSON
      res.status(response.ok ? 200 : response.status).json({ success: response.ok, data });
    } catch {
      // Mail.tm returned HTML or invalid JSON — return friendly JSON
      res.status(500).json({
        success: false,
        error: "Mail.tm returned invalid response. Message not sent.",
        rawHtml: raw // optional
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
