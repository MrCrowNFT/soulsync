/**
 * Generates an AI response using the user's message and relevant memories
 * @param {string} message - The user's message
 * @param {Array} memories - Array of relevant memory objects
 * @param {Array} recentChatEntries - Array of recent chat entries to improve conversational response 
 * @returns {Promise<string>} - The AI's response
 */
export const getLLMResponse = async (
  message,
  memories,
  recentChatEntries = []
) => {
  console.log("------ LLM RESPONSE GENERATION STARTED ------");
  console.log(`Input message: "${message}"`);
  console.log(`Memories provided: ${memories.length}`);
  console.log(`Recent chat entries provided: ${recentChatEntries.length}`);

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

    // Process memories for context
    const relevantMemories = memories.slice(0, 3); // prevent token explosion
    console.log(`Using ${relevantMemories.length} memories for context`);

    // Log memory content
    relevantMemories.forEach((mem, idx) => {
      console.log(
        `Memory ${idx + 1}: ${
          mem.memory ? mem.memory.substring(0, 50) + "..." : "[empty]"
        }`
      );
    });

    // Format memories properly for context
    let memoryContext = "";
    if (relevantMemories.length > 0) {
      memoryContext = relevantMemories
        .map((m, i) => `Memory ${i + 1}: ${m.memory}`)
        .join("\n\n");
    } else {
      memoryContext = "No previous memories available";
    }

    console.log("Memory context length:", memoryContext.length);
    console.log(
      "Memory context preview:",
      memoryContext.substring(0, 100) +
        (memoryContext.length > 100 ? "..." : "")
    );

    // Extract personality traits for additional context
    console.log("Extracting personality traits...");
    const allTraits = relevantMemories.flatMap((m) => m.personality || []);
    console.log(
      `All traits found: ${allTraits.length ? allTraits.join(", ") : "none"}`
    );

    const personalityTraits = allTraits
      .filter((trait, i, self) => self.indexOf(trait) === i)
      .slice(0, 2) // Only use top 2 traits for more concise responses
      .join(", ");

    console.log(`Selected personality traits: ${personalityTraits || "none"}`);

    // Build a clear system prompt with better context separation
    const systemPrompt = `
      You are a supportive, conversational mental health companion. Keep responses brief, genuine and human-like.
      Never use corporate or robotic language. Respond in 1-3 sentences as a supportive friend would.

      The user has previous memories that you should use as context for understanding them better.
      DO NOT directly respond to or reference these memories unless the user explicitly asks about them.
      The memories are provided ONLY to help you understand the user's background and situation.

      ${
        personalityTraits
          ? `The user self-describes as: ${personalityTraits}`
          : ""
      }

      Be concise, warm, and conversational. Use natural, casual language. Match the user's tone and energy level.
      Keep responses short even when the input is short.
    `.trim();

    // Prepare messages with clear separation of user message and memory context
    const messages = [{ role: "system", content: systemPrompt }];

    // Add memories as a separate context message from the assistant
    if (relevantMemories.length > 0) {
      messages.push({
        role: "assistant",
        content: `I'll remember these things about you:\n\n${memoryContext}`,
      });
    }

    // Add recent conversation history as context (up to 5 messages max)
    if (recentChatEntries.length > 0) {
      console.log(
        `Adding ${recentChatEntries.length} recent chat entries to context`
      );

      // Format each chat entry into the appropriate role and content
      recentChatEntries.forEach((entry) => {
        const role = entry.sender === "user" ? "user" : "assistant";
        messages.push({
          role: role,
          content: entry.message,
        });
      });
    }

    // Add the actual user message as the thing to respond to
    messages.push({ role: "user", content: message });

    console.log(
      "Messages array structure prepared with clear context separation"
    );
    console.log(`Total messages: ${messages.length}`);

    console.log("Sending request to OpenAI...");
    console.time("openai_request_time");
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-3.5-turbo",
      messages: messages,
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
