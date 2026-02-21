/**
 * Centralized AI layer. Uses OpenAI API when OPENAI_API_KEY is set; otherwise mock.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function generateArticleBody(title: string, brief: string): Promise<string> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 10) {
    return mockGenerateArticleBody(title, brief);
  }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional content writer. Write a short, engaging article section (2–4 paragraphs) based on the title and brief. Output only the article body, no headings.",
          },
          {
            role: "user",
            content: `Title: ${title}\n\nBrief: ${brief}`,
          },
        ],
        max_tokens: 800,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${err}`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text || mockGenerateArticleBody(title, brief);
  } catch (e) {
    console.error("[ai] generateArticleBody failed", e);
    return mockGenerateArticleBody(title, brief);
  }
}

function mockGenerateArticleBody(title: string, brief: string): string {
  return `[Generated draft — add OPENAI_API_KEY for real AI generation.]

**Title:** ${title}

**Brief:** ${brief}

This is a placeholder. Configure OPENAI_API_KEY in your environment and run "Generate with AI" again to produce real content.`;
}
