async function sendEmail() {
  const to = document.getElementById("toAddress").value.trim();
  const subject = document.getElementById("emailSubject").value.trim();
  const text = document.getElementById("emailBody").value.trim();

  if (!to || !text) {
    document.getElementById("sendMessage").innerText = "Fill all required fields";
    return;
  }

  try {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, from: account.address, to, subject, text })
    });

    const rawResponse = await response.text(); // Always read as text first

    try {
      // Attempt to parse JSON
      const data = JSON.parse(rawResponse);
      if (data.success) {
        document.getElementById("sendMessage").innerText = "Email sent successfully!";
        document.getElementById("toAddress").value = "";
        document.getElementById("emailSubject").value = "";
        document.getElementById("emailBody").value = "";
      } else {
        document.getElementById("sendMessage").innerText = "Error sending email (JSON response):\n" + JSON.stringify(data, null, 2);
      }
    } catch (err) {
      // Failed to parse JSON → show full raw response
      document.getElementById("sendMessage").innerText = "Mail.tm returned a non-JSON response:\n" + rawResponse;
    }
  } catch (err) {
    // Network/server errors
    document.getElementById("sendMessage").innerText = "Network or server error:\n" + err.toString();
  }
}
