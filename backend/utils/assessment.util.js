import { OpenAI } from "openai";
import logger from "../utils/logger.js";

/**
 * Generates an assessment of the user's mental health based on mood entries and memories
 * @param {Array} moodEntries - Recent mood entries
 * @param {Array} memories - Recent memories
 * @param {Number} moodAverage - Average mood score
 * @param {String} moodTrend - Trend of mood (improving, declining, stable)
 * @param {Object} requestLogger - Optional request logger for request-specific logging
 * @returns {Promise<Object>} - Assessment results with insights and recommendations
 */
export const getAssessment = async (
  moodEntries,
  memories,
  moodAverage,
  moodTrend,
  requestLogger = logger
) => {
  const functionStart = Date.now();

  requestLogger.info("Assessment generation started", {
    moodEntriesCount: moodEntries.length,
    memoriesCount: memories.length,
    moodAverage: parseFloat(moodAverage.toFixed(2)),
    moodTrend: moodTrend,
  });

  try {
    // OpenAI client initialization
    requestLogger.info("Initializing OpenAI client for assessment", {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4o",
    });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Prepare memory contents for context
    const memoryContents = memories
      .map((memory, index) => {
        const date = new Date(memory.createdAt).toLocaleDateString();
        return `Memory ${index + 1} (${date}): ${memory.memory}`;
      })
      .join("\n\n");

    requestLogger.info("Memory context prepared for assessment", {
      memoryContentsLength: memoryContents.length,
      memoriesDateRange:
        memories.length > 0
          ? {
              oldest: new Date(
                Math.min(...memories.map((m) => new Date(m.createdAt)))
              ).toLocaleDateString(),
              newest: new Date(
                Math.max(...memories.map((m) => new Date(m.createdAt)))
              ).toLocaleDateString(),
            }
          : null,
    });

    // Prepare mood entry data for context
    const moodData = moodEntries
      .map((entry) => {
        const date = new Date(entry.createdAt).toLocaleDateString();
        return `${date}: ${entry.mood}/5`;
      })
      .join(", ");

    requestLogger.info("Mood data prepared for assessment", {
      moodDataLength: moodData.length,
      moodEntriesDateRange:
        moodEntries.length > 0
          ? {
              oldest: new Date(
                Math.min(...moodEntries.map((e) => new Date(e.createdAt)))
              ).toLocaleDateString(),
              newest: new Date(
                Math.max(...moodEntries.map((e) => new Date(e.createdAt)))
              ).toLocaleDateString(),
            }
          : null,
    });

    // Extract personality traits, emotions, and topics from memories for additional context
    const allPersonality = [
      ...new Set(memories.flatMap((m) => m.personality || [])),
    ];
    const allEmotions = [...new Set(memories.flatMap((m) => m.emotions || []))];
    const allTopics = [...new Set(memories.flatMap((m) => m.topics || []))];

    requestLogger.info("Memory analysis completed", {
      personalityTraitsCount: allPersonality.length,
      emotionsCount: allEmotions.length,
      topicsCount: allTopics.length,
      personalityTraits: allPersonality.length > 0 ? allPersonality : null,
      emotions: allEmotions.length > 0 ? allEmotions : null,
      topics: allTopics.length > 0 ? allTopics : null,
    });

    // Build system prompt
    const systemPrompt = `
      You are an empathetic mental health assessment assistant. Your task is to provide a thoughtful assessment
      of the user's mental well-being based on their recent mood entries and memories.
      
      The assessment should be structured as follows:
      
      1. Overall mental health status - A brief summary of how the user appears to be doing
      2. Key observations - 2-3 specific patterns or issues you've noticed
      3. Recommendations - 2-3 practical suggestions based on the assessment
      
      Your assessment should be compassionate, insightful, and actionable. Do not include any generic advice.
      Make sure recommendations are specific to the user's situation.
      
      Keep your response focused on the provided data. If there are any concerning patterns
      (like severe mood drops, mentions of self-harm, etc.), note them but also recommend professional help.
      
      Always clarify that this is an algorithmic assessment and not a clinical diagnosis.
    `.trim();

    // Create a detailed context message
    const contextMessage = `
      I need to assess a user's mental health based on the following data:
      
      MOOD DATA (last 7 days):
      - Average mood: ${moodAverage.toFixed(2)}/5
      - Mood trend: ${moodTrend}
      - Daily mood entries: ${moodData}
      
      PERSONALITY TRAITS MENTIONED:
      ${
        allPersonality.length > 0
          ? allPersonality.join(", ")
          : "None explicitly mentioned"
      }
      
      EMOTIONS EXPRESSED:
      ${
        allEmotions.length > 0
          ? allEmotions.join(", ")
          : "None explicitly categorized"
      }
      
      TOPICS DISCUSSED:
      ${
        allTopics.length > 0
          ? allTopics.join(", ")
          : "None explicitly categorized"
      }
      
      RECENT MEMORIES:
      ${memoryContents}
      
      Based on this information, please provide a thoughtful mental health assessment with insights and recommendations.
    `.trim();

    const contextStats = {
      systemPromptLength: systemPrompt.length,
      contextMessageLength: contextMessage.length,
      totalPromptLength: systemPrompt.length + contextMessage.length,
    };

    requestLogger.info("Assessment prompt prepared", contextStats);

    // Make OpenAI API call
    const apiCallStart = Date.now();
    requestLogger.info("Sending assessment request to OpenAI API");

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contextMessage },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const apiCallDuration = Date.now() - apiCallStart;

    requestLogger.info("OpenAI assessment response received", {
      apiCallDuration: `${apiCallDuration}ms`,
      tokensUsed: response.usage?.total_tokens || 0,
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      model: response.model || "unknown",
      finishReason: response.choices[0].finish_reason,
    });

    // Process the response to extract sections
    const fullResponse = response.choices[0].message.content.trim();

    requestLogger.info("Processing assessment response", {
      fullResponseLength: fullResponse.length,
    });

    // Parse the assessment into sections
    const assessmentSections = parseAssessment(fullResponse, requestLogger);

    const functionDuration = Date.now() - functionStart;

    requestLogger.info("Assessment generation completed successfully", {
      totalFunctionDuration: `${functionDuration}ms`,
      hasOverallStatus: !!assessmentSections.overallStatus,
      observationsCount: assessmentSections.observations.length,
      recommendationsCount: assessmentSections.recommendations.length,
      assessmentStructure: {
        overallStatusLength: assessmentSections.overallStatus.length,
        observationsLengths: assessmentSections.observations.map(
          (obs) => obs.length
        ),
        recommendationsLengths: assessmentSections.recommendations.map(
          (rec) => rec.length
        ),
      },
    });

    return assessmentSections;
  } catch (error) {
    const functionDuration = Date.now() - functionStart;

    requestLogger.error("Assessment generation failed", {
      error: error.message,
      stack: error.stack,
      errorType: error.name,
      functionDuration: `${functionDuration}ms`,
      openaiError: error.response
        ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          }
        : null,
      inputContext: {
        moodEntriesCount: moodEntries.length,
        memoriesCount: memories.length,
        moodAverage: moodAverage,
        moodTrend: moodTrend,
      },
    });

    // Return a fallback assessment structure
    const fallbackAssessment = {
      overallStatus: "Assessment unavailable due to a system error.",
      observations: ["We encountered an issue while analyzing your data."],
      recommendations: [
        "Please try again later or contact support if this persists.",
      ],
      disclaimer:
        "This is an automated assessment tool and not a clinical diagnosis.",
    };

    requestLogger.info("Returning fallback assessment", {
      fallbackAssessment,
    });

    return fallbackAssessment;
  }
};

/**
 * Parse the AI response into structured sections
 * @param {String} fullResponse - The complete text response from the AI
 * @param {Object} requestLogger - Logger instance for parsing logs
 * @returns {Object} - Structured assessment with sections
 */
function parseAssessment(fullResponse, requestLogger = logger) {
  requestLogger.info("Starting assessment response parsing", {
    responseLength: fullResponse.length,
  });

  // Default structure
  const assessment = {
    overallStatus: "",
    observations: [],
    recommendations: [],
    disclaimer:
      "This is an automated assessment tool and not a clinical diagnosis.",
  };

  try {
    // Extract overall status (first paragraph or section before any headers)
    const overallMatch = fullResponse.match(/^(.*?)(?=\n\n|\n#|\n\d\.|$)/s);
    if (overallMatch) {
      assessment.overallStatus = overallMatch[0].trim();
      requestLogger.debug("Overall status extracted", {
        overallStatusLength: assessment.overallStatus.length,
      });
    }

    // Extract key observations
    const observationsMatch = fullResponse.match(
      /(?:Key Observations|Observations|Key observations|OBSERVATIONS):(.*?)(?=\n\n|\n#|\n[A-Za-z]+:|$)/is
    );
    if (observationsMatch) {
      const observationText = observationsMatch[1].trim();

      // Split by bullet points or numbers
      const observationPoints = observationText
        .split(/\n[-*•]|\n\d+\./)
        .filter((point) => point.trim().length > 0)
        .map((point) => point.trim());

      if (observationPoints.length > 0) {
        assessment.observations = observationPoints;
        requestLogger.debug("Observations extracted", {
          observationsCount: observationPoints.length,
          observationsLengths: observationPoints.map((obs) => obs.length),
        });
      }
    }

    // Extract recommendations
    const recommendationsMatch = fullResponse.match(
      /(?:Recommendations|RECOMMENDATIONS):(.*?)(?=\n\n|\n#|\n[A-Za-z]+:|$)/is
    );
    if (recommendationsMatch) {
      const recommendationText = recommendationsMatch[1].trim();

      // Split by bullet points or numbers
      const recommendationPoints = recommendationText
        .split(/\n[-*•]|\n\d+\./)
        .filter((point) => point.trim().length > 0)
        .map((point) => point.trim());

      if (recommendationPoints.length > 0) {
        assessment.recommendations = recommendationPoints;
        requestLogger.debug("Recommendations extracted", {
          recommendationsCount: recommendationPoints.length,
          recommendationsLengths: recommendationPoints.map((rec) => rec.length),
        });
      }
    }

    // If sections weren't found with the headers, try to extract from numbered paragraphs
    if (assessment.observations.length === 0) {
      requestLogger.debug("Attempting fallback parsing with numbered sections");

      const numberedSections = fullResponse.match(
        /\d+\.\s+(.*?)(?=\n\d+\.|$)/gs
      );
      if (numberedSections && numberedSections.length >= 2) {
        // Assume first numbered section after intro is observations
        assessment.observations = [
          numberedSections[0].replace(/^\d+\.\s+/, "").trim(),
        ];
        // And second is recommendations
        if (
          assessment.recommendations.length === 0 &&
          numberedSections.length >= 3
        ) {
          assessment.recommendations = [
            numberedSections[1].replace(/^\d+\.\s+/, "").trim(),
          ];
        }

        requestLogger.debug("Fallback numbered sections parsing completed", {
          numberedSectionsFound: numberedSections.length,
          observationsExtracted: assessment.observations.length,
          recommendationsExtracted: assessment.recommendations.length,
        });
      }
    }

    // If we still don't have structured data, use fallback approach
    if (
      assessment.overallStatus === "" &&
      assessment.observations.length === 0
    ) {
      requestLogger.debug("Attempting final fallback parsing with paragraphs");

      const paragraphs = fullResponse.split("\n\n").filter((p) => p.trim());
      if (paragraphs.length > 0) {
        assessment.overallStatus = paragraphs[0].trim();

        if (paragraphs.length > 1) {
          assessment.observations = [paragraphs[1].trim()];
        }

        if (paragraphs.length > 2) {
          assessment.recommendations = [paragraphs[2].trim()];
        }

        requestLogger.debug("Final fallback parsing completed", {
          paragraphsFound: paragraphs.length,
          finalAssessmentStructure: {
            hasOverallStatus: !!assessment.overallStatus,
            observationsCount: assessment.observations.length,
            recommendationsCount: assessment.recommendations.length,
          },
        });
      }
    }

    requestLogger.info("Assessment parsing completed", {
      parsingSuccessful: true,
      finalStructure: {
        overallStatusLength: assessment.overallStatus.length,
        observationsCount: assessment.observations.length,
        recommendationsCount: assessment.recommendations.length,
        hasAllSections: !!(
          assessment.overallStatus &&
          assessment.observations.length > 0 &&
          assessment.recommendations.length > 0
        ),
      },
    });
  } catch (parseError) {
    requestLogger.error("Assessment parsing failed", {
      error: parseError.message,
      stack: parseError.stack,
      responseLength: fullResponse.length,
    });
  }

  return assessment;
}
