import logger from "./logger.js";

/**
 * Generates an AI response using the user's message and relevant memories
 * @param {string} message - The user's message
 * @param {Array} memories - Array of relevant memory objects
 * @param {Array} recentChatEntries - Array of recent chat entries to improve conversational response
 * @param {Object} ragContext - RAG context object with relevant knowledge base content
 * @param {Object} requestLogger - Optional request logger for request-specific logging
 * @returns {Promise<string>} - The AI's response
 */
export const getLLMResponse = async (
  message,
  memories,
  recentChatEntries = [],
  ragContext,
  requestLogger = logger
) => {
  const functionStart = Date.now();
  
  requestLogger.info("LLM response generation started", {
    messageLength: message?.length || 0,
    memoriesCount: memories.length,
    recentChatEntriesCount: recentChatEntries.length,
    hasRagContext: !!ragContext?.context,
    ragContextLength: ragContext?.context?.length || 0
  });

  try {
    if (!message || typeof message !== "string") {
      requestLogger.error("Invalid message input for LLM", {
        messageType: typeof message,
        messageValue: message
      });
      throw new Error("Invalid message input");
    }

    // OpenAI setup validation
    requestLogger.info("Initializing OpenAI client", {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo"
    });

    const { OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Process memories for context
    const relevantMemories = memories.slice(0, 3); // prevent token explosion
    
    requestLogger.info("Processing memories for context", {
      totalMemories: memories.length,
      selectedMemories: relevantMemories.length,
      memoryPreview: relevantMemories.map((mem, idx) => ({
        index: idx + 1,
        preview: mem.memory ? mem.memory.substring(0, 50) + "..." : "[empty]",
        hasPersonality: !!(mem.personality && mem.personality.length > 0)
      }))
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

    // Extract personality traits for additional context
    const allTraits = relevantMemories.flatMap((m) => m.personality || []);
    const personalityTraits = allTraits
      .filter((trait, i, self) => self.indexOf(trait) === i)
      .slice(0, 2) // Only use top 2 traits for more concise responses
      .join(", ");

    requestLogger.info("Memory context prepared", {
      memoryContextLength: memoryContext.length,
      allTraitsCount: allTraits.length,
      selectedPersonalityTraits: personalityTraits || "none",
      memoryContextPreview: memoryContext.substring(0, 100) + (memoryContext.length > 100 ? "..." : "")
    });

    // Build a clear system prompt with RAG knowledge integration
    let systemPrompt = `
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

    // Add RAG context to system prompt if available
    if (ragContext?.context && ragContext.context.trim()) {
      requestLogger.info("Adding RAG knowledge base context to system prompt", {
        ragContextLength: ragContext.context.length
      });
      
      systemPrompt += `\n\n--- KNOWLEDGE BASE CONTEXT ---
The following information from mental health resources may be relevant to the user's question.
Use this information to inform your response, but don't quote it directly or mention "according to sources".
Integrate the knowledge naturally into your conversational response.

${ragContext.context}

Remember: Keep your response conversational and brief, even with this additional context.`;
    }

    // Prepare messages with clear separation of user message and memory context
    const messages = [{ role: "system", content: systemPrompt }];

    // Add memories as a separate context message from the assistant
    if (relevantMemories.length > 0) {
      messages.push({
        role: "system",
        content: `I'll remember these things about you:\n\n${memoryContext}`,
      });
    }

    // Add recent conversation history as context (up to 5 messages max)
    if (recentChatEntries.length > 0) {
      requestLogger.info("Adding recent chat entries to conversation context", {
        recentEntriesCount: recentChatEntries.length
      });

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

    const messagesStructure = {
      totalMessages: messages.length,
      systemMessages: messages.filter(m => m.role === "system").length,
      userMessages: messages.filter(m => m.role === "user").length,
      assistantMessages: messages.filter(m => m.role === "assistant").length
    };

    requestLogger.info("Messages array prepared for OpenAI", messagesStructure);

    // Make OpenAI API call
    const apiCallStart = Date.now();
    requestLogger.info("Sending request to OpenAI API");
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.8, 
      max_tokens: 300, 
      presence_penalty: 0.6, 
      frequency_penalty: 0.5, 
    });

    const apiCallDuration = Date.now() - apiCallStart;
    const functionDuration = Date.now() - functionStart;

    const aiResponse = response.choices[0].message.content.trim();

    requestLogger.info("LLM response generation completed successfully", {
      aiResponseLength: aiResponse.length,
      tokensUsed: response.usage?.total_tokens || 0,
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      apiCallDuration: `${apiCallDuration}ms`,
      totalFunctionDuration: `${functionDuration}ms`,
      model: response.model || "unknown",
      finishReason: response.choices[0].finish_reason
    });

    // Log response preview for debugging
    requestLogger.debug("AI response preview", {
      responsePreview: aiResponse.substring(0, 100) + (aiResponse.length > 100 ? "..." : "")
    });

    return aiResponse;
  } catch (error) {
    const functionDuration = Date.now() - functionStart;
    
    requestLogger.error("LLM response generation failed", {
      error: error.message,
      stack: error.stack,
      errorType: error.name,
      functionDuration: `${functionDuration}ms`,
      openaiError: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : null,
      inputContext: {
        messageLength: message?.length || 0,
        memoriesCount: memories.length,
        recentChatEntriesCount: recentChatEntries.length,
        hasRagContext: !!ragContext?.context
      }
    });

    // Return fallback response
    const fallbackResponse = "Sorry, I'm having a moment. Can we try that again?";
    requestLogger.info("Returning fallback response", {
      fallbackResponse
    });
    
    return fallbackResponse;
  }
};