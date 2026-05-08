export async function askChatbot(messages, dashboardContext) {
  const token = import.meta.env.VITE_AI_TOKEN;
  if (!token) {
    throw new Error("AI Token missing");
  }

  // Construct the system prompt using current dashboard data
  const systemPrompt = `You are an AI assistant for a real-time dashboard. 
You can ONLY answer questions using the following data. Do NOT use outside knowledge. Do NOT guess.

DASHBOARD DATA:
ISS Location: Lat ${dashboardContext.iss.lat}, Lng ${dashboardContext.iss.lng}
ISS Speed: ${dashboardContext.iss.speed} km/h
ISS Nearest Location: ${dashboardContext.iss.locationName}
Number of Astronauts in space: ${dashboardContext.iss.astronauts}
Recent News Headlines:
${dashboardContext.news.map((n, i) => `${i+1}. ${n.title} (Source: ${n.source.name})`).join('\n')}

If the user asks something not covered by this data, politely decline to answer.`;

  const apiMessages = [
    { role: "user", content: systemPrompt },
    { role: "assistant", content: "Understood. I will only use the provided dashboard data to answer your questions." },
    ...messages.map(m => ({ role: m.isBot ? "assistant" : "user", content: m.text }))
  ];

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: "Qwen/Qwen3.6-35B-A3B:featherless-ai",
        messages: apiMessages,
        max_tokens: 150
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("HF API Error:", errText);
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    console.error("Chatbot query failed:", error);
    throw error;
  }
}
