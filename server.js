import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Route API pour le chat
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "Message vide !" });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Tu es EducGPT, un professeur de collège polyvalent.
Tu réponds uniquement aux questions scolaires en français.
`
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Erreur OpenRouter";
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.json({ reply: "Erreur réseau" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
