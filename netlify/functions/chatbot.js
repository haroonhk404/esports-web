// Gemini chatbot — API key environment variable se aati hai, code mein nahi
const MODEL = "gemini-2.5-flash"; // chaho to "gemini-3.5-flash" kar lo
const SYSTEM_PROMPT =
  "Tum 'Arena Bot' ho — ek dostana esports tournament assistant. " +
  "Registration, tournaments, leaderboard aur rules ke sawaalon ka chhota, " +
  "clear jawab do. Jawab thoda casual aur helpful rakho.";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");
    if (!message || !message.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: "Message khaali hai" }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "GEMINI_API_KEY set nahi hai" }) };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Gemini error:", data);
      return { statusCode: 502, body: JSON.stringify({ error: data?.error?.message || "Gemini API error" }) };
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf kijiye, abhi jawab nahi de paya.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};




