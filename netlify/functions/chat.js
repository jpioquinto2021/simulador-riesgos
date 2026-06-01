exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*" };
  
  try {
    const body = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    const contents = body.messages.map((m, i) => {
      const role = m.role === "assistant" ? "model" : "user";
      const text = i === 0 
        ? `${body.system}\n\n---\n\n${m.content}`
        : m.content;
      return { role, parts: [{ text }] };
    });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: { maxOutputTokens: 1000 }
        })
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text 
      || JSON.stringify(data);

    return { statusCode: 200, headers, body: JSON.stringify({ content: [{ text }] }) };

  } catch (err) {
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ content: [{ text: "ERROR: " + err.message }] }) 
    };
  }
};
