export async function createAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  return {
    enabled: Boolean(apiKey),
    apiKeyPresent: Boolean(apiKey)
  };
}
