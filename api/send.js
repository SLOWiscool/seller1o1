export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");
  const { action } = req.body;

  async function safeParse(resp) {
    try {
      const ct = resp.headers.get("content-type") || "";
      const text = await resp.text();
      if (!text) return {};
      if (ct.includes("application/json")) return JSON.parse(text);
      return { error: "Non-JSON response", text };
    } catch (e) {
      return { error: "Failed to parse response" };
    }
  }

  try {
    if (action === "create-random") {
      // 1. Get a random valid domain
      const d = await fetch("https://api.mail.tm/domains");
      const domains = await safeParse(d);
      if (!domains["hydra:member"] || !domains["hydra:member"][0]) 
        return res.status(500).json({ error: "No valid domains from mail.tm" });

      const domain = domains["hydra:member"][0].domain;

      // 2. Random username
      const username = "user" + Math.floor(Math.random() * 100000);
      const password = "pass1234";
      const address = username + "@" + domain;

      // 3. Create account
      const r = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });
      const account = await safeParse(r);

      if (!account.id) return res.status(500).json({ error: "Account creation failed", details: account });

      // 4. Login
      const l = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });
      const token = await safeParse(l);

      if (!token.token) return res.status(500).json({ error: "Login failed", details: token });

      return res.json({ token: token.token, email: address });
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
