import { OpenAI } from "openai";

/**
 * Generates an assessment of the user's mental health based on mood entries and memories
 * @param {Array} moodEntries - Recent mood entries
 * @param {Array} memories - Recent memories
 * @param {Number} moodAverage - Average mood score
 * @param {String} moodTrend - Trend of mood (improving, declining, stable)
 * @returns {Promise<Object>} - Assessment results with insights and recommendations
 */
export const getAssessment = async (
  moodEntries,
  memories,
  moodAverage,
  moodTrend
) => {
  console.log("------ ASSESSMENT GENERATION STARTED ------");
  console.log(`Mood entries provided: ${moodEntries.length}`);
  console.log(`Memories provided: ${memories.length}`);
  console.log(`Mood average: ${moodAverage}`);
  console.log(`Mood trend: ${moodTrend}`);

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // prepare memory contents for context
    const memoryContents = memories
      .map((memory, index) => {
        // include the date and memory content
        const date = new Date(memory.createdAt).toLocaleDateString();
        return `Memory ${index + 1} (${date}): ${memory.memory}`;
      })
      .join("\n\n");

    console.log("Memory context prepared");

    // prepare mood entry data for context
    const moodData = moodEntries
      .map((entry) => {
        const date = new Date(entry.createdAt).toLocaleDateString();
        return `${date}: ${entry.mood}/5`;
      })
      .join(", ");

    console.log("Mood data prepared");

    // extract personality traits, emotions, and topics from memories for additional context
    const allPersonality = [
      ...new Set(memories.flatMap((m) => m.personality || [])),
    ];
    const allEmotions = [...new Set(memories.flatMap((m) => m.emotions || []))];
    const allTopics = [...new Set(memories.flatMap((m) => m.topics || []))];

    console.log(`Personality traits found: ${allPersonality.length}`);
    console.log(`Emotions found: ${allEmotions.length}`);
    console.log(`Topics found: ${allTopics.length}`);

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

    console.log("Context message prepared");
    console.log("Sending request to OpenAI...");
    console.time("openai_assessment_time");

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contextMessage },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    console.timeEnd("openai_assessment_time");
    console.log("OpenAI response received");

    // Process the response to extract sections
    const fullResponse = response.choices[0].message.content.trim();

    // Parse the assessment into sections
    const assessmentSections = parseAssessment(fullResponse);

    console.log("Assessment parsed into structured format");
    console.log("------ ASSESSMENT GENERATION COMPLETED SUCCESSFULLY ------");

    return assessmentSections;
  } catch (error) {
    console.error("------ ASSESSMENT GENERATION FAILED ------");
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);

    // Check for specific OpenAI errors
    if (error.response) {
      console.error(`OpenAI Error Status: ${error.response.status}`);
      console.error(`OpenAI Error Data:`, error.response.data);
    }

    // Return a fallback assessment structure
    return {
      overallStatus: "Assessment unavailable due to a system error.",
      observations: ["We encountered an issue while analyzing your data."],
      recommendations: [
        "Please try again later or contact support if this persists.",
      ],
      disclaimer:
        "This is an automated assessment tool and not a clinical diagnosis.",
    };
  }
};

/**
 * Parse the AI response into structured sections
 * @param {String} fullResponse - The complete text response from the AI
 * @returns {Object} - Structured assessment with sections
 */
function parseAssessment(fullResponse) {
  // Default structure
  const assessment = {
    overallStatus: "",
    observations: [],
    recommendations: [],
    disclaimer:
      "This is an automated assessment tool and not a clinical diagnosis.",
  };

  // Extract overall status (first paragraph or section before any headers)
  const overallMatch = fullResponse.match(/^(.*?)(?=\n\n|\n#|\n\d\.|$)/s);
  if (overallMatch) {
    assessment.overallStatus = overallMatch[0].trim();
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
    }
  }

  // If sections weren't found with the headers, try to extract from numbered paragraphs
  if (assessment.observations.length === 0) {
    const numberedSections = fullResponse.match(/\d+\.\s+(.*?)(?=\n\d+\.|$)/gs);
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
    }
  }

  // If we still don't have structured data, use fallback approach
  if (assessment.overallStatus === "" && assessment.observations.length === 0) {
    const paragraphs = fullResponse.split("\n\n").filter((p) => p.trim());
    if (paragraphs.length > 0) {
      assessment.overallStatus = paragraphs[0].trim();

      if (paragraphs.length > 1) {
        assessment.observations = [paragraphs[1].trim()];
      }

      if (paragraphs.length > 2) {
        assessment.recommendations = [paragraphs[2].trim()];
      }
    }
  }

  return assessment;
}
