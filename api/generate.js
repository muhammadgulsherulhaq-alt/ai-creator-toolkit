
export default async function handler(req, res) {
  // Allow GitHub Pages to call this API
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://muhammadgulsherulhaq-alt.github.io"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle browser CORS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { topic, platform, tone } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured on Vercel."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert social media content creator. Return only valid JSON."
            },
            {
              role: "user",
              content: `Create content ideas for:
Topic: ${topic}
Platform: ${platform}
Tone: ${tone}

Return JSON exactly in this format:
{
  "titles": ["5 titles"],
  "hooks": ["5 hooks"],
  "thumbnails": ["5 thumbnail text ideas"]
}`
            }
          ],
          response_format: {
            type: "json_object"
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();

      return res.status(response.status).json({
        error: error
      });
    }

    const data = await response.json();

    const result = JSON.parse(
      data.choices[0].message.content
    );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
