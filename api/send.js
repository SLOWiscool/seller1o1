export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Only POST allowed");

  const { action } = req.body;

  async function safeParse(resp) {
    try {
      const text = await resp.text();
      return text ? JSON.parse(text) : {};
    } catch (e) {
      return { error: "Failed to parse response" };
    }
  }

  try {
    if (action === "create-random") {
      // 1. Fetch domains
      const d = await fetch("https://api.mail.tm/domains");
      const domainsData = await safeParse(d);
      let domains = domainsData["hydra:member"] || [];

      // 2. Fallback if empty
      if (!domains.length) domains = [{ domain: "mail.tm" }];

      // 3. Pick random domain
      const domain = domains[Math.floor(Math.random() * domains.length)].domain;

      // 4. Random username
      const username = "user" + Math.floor(Math.random() * 100000);
      const password = "pass1234";
      const address = `${username}@${domain}`;

      // 5. Create account
      const r = await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
      });
      const account = await safeParse(r);

      // If account fails, try fallback domain
      if (!account.id) {
        // Retry with mail.tm
        const fallbackAddr = `${username}@mail.tm`;
        const fr = await fetch("https://api.mail.tm/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: fallbackAddr, password }),
        });
        const fallbackAccount = await safeParse(fr);
        if (!fallbackAccount.id) {
          return res.status(500).json({
            error: "Account creation failed on all domains",
            details: fallbackAccount,
          });
        }
        // login
        const l = await fetch("https://api.mail.tm/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: fallbackAddr, password }),
        });
        const token = await safeParse(l);
        return res.json({ token: token.token, email: fallbackAddr });
      }

      // 6. Login
      const l = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password }),
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
