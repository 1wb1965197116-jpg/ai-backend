export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    // 🔹 Call OpenAI
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Translate everything to English only." },
          { role: "user", content: text }
        ]
      })
    });

    const aiData = await aiResponse.json();

    const translated =
      aiData?.choices?.[0]?.message?.content || "Translation failed";

    // 🔹 Save to Supabase (optional but included)
    await fetch("https://xszgijqnktliwltaaukj.supabase.co/rest/v1/translations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": "Bearer " + process.env.SUPABASE_KEY
      },
      body: JSON.stringify({
        original: text,
        translated: translated,
        source: "vercel"
      })
    });

    return res.status(200).json({ translated });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
