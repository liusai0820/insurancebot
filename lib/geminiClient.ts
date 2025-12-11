export async function callOpenRouterAI(prompt: string, model?: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const selectedModel = model || process.env.OPENROUTER_MODEL || 'openai/gpt-4-turbo';

  try {
    console.log(`[OpenRouter] Calling model: ${selectedModel}`);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'InsureMate Pro',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });
      throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log(`[OpenRouter] Response received (${content.length} chars)`);
    return content;
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.message);
    throw error;
  }
}
