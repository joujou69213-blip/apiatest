import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // autorise toutes les origines (front Free-Hosting)
app.use(express.json());

// Route API pour le chat
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "Message vide !" });

  try {
    // Prompt complet pour EducGPT
    const systemPrompt = `
Tu es EducGPT, un professeur de collège polyvalent (français, maths, SVT, technologie, histoire…).
- Tu parles uniquement en français.
- Tu réponds uniquement aux questions scolaires.
- Tu peux refuser poliment toute question hors scolaire avec: "Je ne peux répondre qu'aux questions scolaires."
- Tu expliques de manière claire et pédagogique.
- Tu peux utiliser du Markdown: **gras**, *italique*, \`\`\`code\`\`\` pour le code.
- Tu peux utiliser des blocs mathématiques avec LaTeX: $x^2 + y^2 = z^2$.
- Sois encourageant et patient avec l'élève.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` // clé à mettre dans Render env variables
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
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
