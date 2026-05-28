exports.handler = async (event) => {
  const headers = { "Access-Control-Allow-Origin": "*" };
  
  try {
    const body = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    const messages = body.messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: body.system }] },
          contents: messages,
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
