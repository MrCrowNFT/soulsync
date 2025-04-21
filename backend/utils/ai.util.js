/**
 * Generates an AI response using the user's message and relevant memories
 * @param {string} message - The user's message
 * @param {Array} memories - Array of relevant memory objects
 * @returns {Promise<string>} - The AI's response
 */
export const getLLMResponse = async (message, memories) => {
  try {
    if (!message || typeof message !== "string") {
      throw new Error("Invalid message input");
    }

    const { OpenAI } = await import("openai");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const truncatedMemories = memories.slice(0, 5); // prevent token explosion so wallet don't die

    const memoryContext =
      truncatedMemories.length > 0
        ? truncatedMemories.map((m) => `- ${m.memory}`).join("\n")
        : "No relevant memories found for this user.";

    const personalityTraits = truncatedMemories
      .flatMap((m) => m.personality)
      .filter((trait, i, self) => self.indexOf(trait) === i)
      .join(", ");

    const personalityContext = personalityTraits
      ? `\nThe user has described themselves as: ${personalityTraits}.`
      : "";

    const prompt = `
  User said: "${message}"
  
  User's relevant memories:
  ${memoryContext}
  ${personalityContext}
  
  Respond as a caring, thoughtful friend would. Be genuine, conversational, and don't sound artificial. Use the memories to personalize your message naturally. If the user is distressed, respond with empathy and support. If they're sharing something positive, celebrate with them.
      `.trim();

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a supportive mental health companion.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating LLM response:", error);
    return "I'm sorry, I'm having trouble processing that right now. Can you please try again?";
  }
};
