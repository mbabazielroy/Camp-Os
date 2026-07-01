import OpenAI from "openai";

// Server-only. Never import this from a Client Component - it reads the
// secret API key and must not end up in the browser bundle.
let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}
