export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const prompt = (req.body && req.body.prompt) || "";
  if (!prompt || prompt.length > 6000) return res.status(400).json({ error: "bad request" });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: "upstream" });
    const d = await r.json();
    const text = (d.content || []).map(b => b.text || "").join("");
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: "server" });
  }
}
