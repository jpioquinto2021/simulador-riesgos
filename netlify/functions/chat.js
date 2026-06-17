exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*" };
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxV4SnwJTI9z_gTBsMSb7zTKFMP2U9KznNFshLC1qWh-4-OV8WvJAESfES0SJm166bE/exec"
  try {
    const body = JSON.parse(event.body);

    // Registro o progreso → Apps Script
    if (body.type === "register" || body.type === "progress") {
      await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      return { statusCode: 200, headers, body: JSON.stringify({ status: "ok" }) };
    }

    // Chat → Anthropic
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        system: body.system,
        messages: body.messages
      })
    });
    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (err) {
    return { statusCode: 200, headers,
      body: JSON.stringify({ content: [{ text: "ERROR: " + err.message }] }) };
  }
};
