exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*" };
  try {
    const body = JSON.parse(event.body);

    // Registro en Google Sheet
    if (body.type === "register") {
      await fetch("https://script.google.com/macros/s/AKfycby8IxiXkyi2WiEx56iI6BRkQpOIArxGILZEKpuNoi5_Oq20k40twf0ydjFvyg5D2da1/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      return { statusCode: 200, headers, body: JSON.stringify({ status: "ok" }) };
    }

    // Chat con Anthropic
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
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
