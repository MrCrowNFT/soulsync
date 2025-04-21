/**
 * Generates an AI response using the user's message and relevant memories
 * @param {string} message - The user's message
 * @param {Array} memories - Array of relevant memory objects
 * @returns {Promise<string>} - The AI's response
 */
export const getLLMResponse = async (message, memories) => {
  console.log("------ LLM RESPONSE GENERATION STARTED ------");
  console.log(`Input message: "${message}"`);
  console.log(`Memories provided: ${memories.length}`);

  try {
    if (!message || typeof message !== "string") {
      console.error("ERROR: Invalid message input type:", typeof message);
      throw new Error("Invalid message input");
    }

    console.log("Importing OpenAI...");
    const { OpenAI } = await import("openai");

    console.log(
      `OpenAI API Key available: ${process.env.OPENAI_API_KEY ? "Yes" : "No"}`
    );
    console.log(`Using model: ${process.env.OPENAI_MODEL || "gpt-3.5-turbo"}`);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log(`Truncating memories from ${memories.length} to max 3...`);
    const truncatedMemories = memories.slice(0, 3); // prevent token explosion so wallet don't die
    console.log(`Using ${truncatedMemories.length} memories for context`);

    // Log memory content
    truncatedMemories.forEach((mem, idx) => {
      console.log(
        `Memory ${idx + 1}: ${
          mem.memory ? mem.memory.substring(0, 50) + "..." : "[empty]"
        }`
      );
    });

    const memoryContext =
      truncatedMemories.length > 0
        ? truncatedMemories.map((m) => m.memory).join(" | ")
        : "No prior context";

    console.log("Memory context length:", memoryContext.length);
    console.log(
      "Memory context preview:",
      memoryContext.substring(0, 100) +
        (memoryContext.length > 100 ? "..." : "")
    );

    console.log("Extracting personality traits...");
    const allTraits = truncatedMemories.flatMap((m) => m.personality);
    console.log(
      `All traits found: ${allTraits.length ? allTraits.join(", ") : "none"}`
    );

    const personalityTraits = allTraits
      .filter((trait, i, self) => self.indexOf(trait) === i)
      .slice(0, 2) // Only use top 2 traits for more concise responses
      .join(", ");

    console.log(`Selected personality traits: ${personalityTraits || "none"}`);

    const prompt = `
      User: "${message}"
      
      Context: ${memoryContext}${
      personalityTraits ? ` | User self-describes as: ${personalityTraits}` : ""
    }
      
      Respond in 1-3 sentences as a supportive friend would. Be concise, warm, and conversational. Use natural, casual language. Match the user's tone and energy level. Refer to memories naturally without explicitly mentioning them.
      Keep responses short even when the input is short.
      `.trim();

    console.log("Prompt length:", prompt.length);
    console.log("Prompt preview:", prompt.substring(0, 150) + "...");

    console.log("Sending request to OpenAI...");
    console.time("openai_request_time");
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a supportive, conversational mental health companion. Keep responses brief, genuine and human-like. Never use corporate or robotic language.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8, // Increased for more natural variation
      max_tokens: 200, // Reduced to encourage brevity
      presence_penalty: 0.6, // Added to discourage repetitive language
      frequency_penalty: 0.5, // Added to encourage diverse vocabulary
    });
    console.timeEnd("openai_request_time");

    console.log("OpenAI response received");
    console.log(
      `Response tokens used: ${response.usage?.total_tokens || "N/A"}`
    );

    const aiResponse = response.choices[0].message.content.trim();
    console.log(`AI response length: ${aiResponse.length} characters`);
    console.log(`AI response: "${aiResponse}"`);

    console.log("------ LLM RESPONSE GENERATION COMPLETED SUCCESSFULLY ------");
    return aiResponse;
  } catch (error) {
    console.error("------ LLM RESPONSE GENERATION FAILED ------");
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);

    // Check for specific OpenAI errors
    if (error.response) {
      console.error(`OpenAI Error Status: ${error.response.status}`);
      console.error(`OpenAI Error Data:`, error.response.data);
    }

    console.error("Returning fallback response");
    return "Sorry, I'm having a moment. Can we try that again?";
  }
};
