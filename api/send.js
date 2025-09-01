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
        subject,
        text
      })
    });

    const textResponse = await r.text();
    let data;
    try { data = JSON.parse(textResponse); } 
    catch(e){ return res.status(500).json({ error: "Non-JSON response", raw:textResponse }); }

    if(r.ok) res.status(200).json(data);
    else res.status(r.status).json({ error:"Failed to send", details:data });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
