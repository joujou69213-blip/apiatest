import express from "express";
import fetch from "node-fetch"; // Node 24+, sinon global fetch
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // index.html, chat.html, style.css

// Route API pour le chat
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "Message vide !" });

  try {
    // Prompt système pour que l'IA devienne un professeur de collège
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " // Mets ta vraie clé
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Tu es EducGPT, un professeur de collège polyvalent (français, maths, SVT, technologie, histoire…).
- Tu parles uniquement en français.
- Tu réponds uniquement aux questions scolaires.
- Tu peux refuser poliment toute question hors scolaire avec: "Je ne peux répondre qu'aux questions scolaires."
- Tu expliques de manière claire et pédagogique.
- Tu peux utiliser du Markdown: **gras**, *italique*, ` + "```code```" + ` pour le code.
- Tu peux utiliser des blocs mathématiques avec LaTeX: $x^2 + y^2 = z^2$.
- Sois encourageant et patient avec l'élève.
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

// Redirection vers chat.html
app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// Page d’accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

