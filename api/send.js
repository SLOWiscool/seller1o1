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

    // Try parsing JSON safely
    let data;
    const raw = await response.text();
    try {
      data = JSON.parse(raw);
    } catch (err) {
      // Mail.tm returned HTML or invalid JSON
      document.getElementById("sendMessage").innerText = "Full error response:\n" + raw;
      return;
    }

    if (data.success) {
      document.getElementById("sendMessage").innerText = "Email sent successfully!";
      document.getElementById("toAddress").value = "";
      document.getElementById("emailSubject").value = "";
      document.getElementById("emailBody").value = "";
    } else {
      document.getElementById("sendMessage").innerText = "Error sending email:\n" + JSON.stringify(data);
    }
  } catch (err) {
    document.getElementById("sendMessage").innerText = "Network or server error:\n" + err;
  }
}
