import nlp from "compromise";
import Sentiment from "sentiment";
import { Memory } from "../models/memory.model.js";
import logger from "./logger.js";

// sentiment analyzer
const sentimentAnalyzer = new Sentiment();

/**
 * Analyzes a user message to determine if it contains memory-worthy information
 * @param {string} userId - The user ID
 * @param {string} message - The message to analyze
 * @param {Array} embedding - The message embedding
 * @returns {Promise<Memory|null>} - A Memory object or null if no memory was extracted
 */
export const analyzeAndExtractMemory = async (userId, message, embedding) => {
  const startTime = Date.now();

  logger.info("Memory analysis started", {
    userId,
    messageLength: message?.length || 0,
    hasEmbedding: !!embedding,
    operation: "analyzeAndExtractMemory",
  });

  try {
    // Process the message with compromise
    const nlpStartTime = Date.now();
    const doc = nlp(message);
    const nlpDuration = Date.now() - nlpStartTime;

    logger.debug("NLP processing completed", {
      userId,
      nlpDuration: `${nlpDuration}ms`,
      operation: "analyzeAndExtractMemory",
    });

    // Initialize entities object
    const entities = {
      people: [],
      pets: [],
      locations: [],
      emotions: [],
      topics: [],
      likes: [],
      dislikes: [],
      goals: [],
      hobbies: [],
      personality: [],
    };

    // Extract people
    doc.people().forEach((person) => {
      // only proper names
      if (!person.has("#Pronoun") && person.has("#ProperNoun")) {
        entities.people.push(person.text());
      }
    });

    // Extract places
    doc.places().forEach((place) => {
      entities.locations.push(place.text());
    });

    // Extract emotions using standalone sentiment analysis
    const sentimentStartTime = Date.now();
    const sentimentResult = sentimentAnalyzer.analyze(message);
    const sentimentDuration = Date.now() - sentimentStartTime;

    logger.debug("Sentiment analysis completed", {
      userId,
      sentimentScore: sentimentResult.score,
      sentimentDuration: `${sentimentDuration}ms`,
      operation: "analyzeAndExtractMemory",
    });

    if (sentimentResult.score > 2) {
      entities.emotions.push("positive");
    } else if (sentimentResult.score < -2) {
      entities.emotions.push("negative");
    }

    // Find specific emotion words
    const emotionWords = {
      positive: [
        "happy",
        "joyful",
        "excited",
        "delighted",
        "content",
        "pleased",
      ],
      negative: [
        "sad",
        "angry",
        "upset",
        "frustrated",
        "anxious",
        "worried",
        "depressed",
      ],
    };

    Object.entries(emotionWords).forEach(([category, words]) => {
      words.forEach((word) => {
        if (doc.has(word)) {
          entities.emotions.push(word);
        }
      });
    });

    // Extract likes
    doc.match("(like|love|enjoy) *").forEach((match) => {
      const terms = match.terms();
      if (terms.length > 1) {
        // Get what's after like/love/enjoy
        const likedThing = terms
          .slice(1)
          .map((t) => t.text())
          .join(" ")
          .trim();
        if (likedThing) {
          entities.likes.push(likedThing);
        }
      }
    });

    // Extract dislikes
    doc.match("(hate|dislike|can't stand) *").forEach((match) => {
      const terms = match.terms();
      if (terms.length > 1) {
        const dislikedThing = terms
          .slice(1)
          .map((t) => t.text())
          .join(" ")
          .trim();
        if (dislikedThing) {
          entities.dislikes.push(dislikedThing);
        }
      }
    });

    // Extract goals
    doc
      .match("(want to|going to|plan to|hope to|goal is to) *")
      .forEach((match) => {
        const terms = match.terms();
        const triggerWords = ["want", "going", "plan", "hope", "goal"];

        // Find the index where the actual goal starts
        let startIndex = 0;
        for (let i = 0; i < terms.length; i++) {
          const term = terms[i].text().toLowerCase();
          if (
            triggerWords.some((word) => term.includes(word)) ||
            term === "to" ||
            term === "is"
          ) {
            startIndex = i + 1;
          }
        }

        if (startIndex < terms.length) {
          const goalText = terms
            .slice(startIndex)
            .map((t) => t.text())
            .join(" ")
            .trim();
          if (goalText) {
            entities.goals.push(goalText);
          }
        }
      });

    // Extract pets
    doc.match("(my|our) (dog|cat|pet) *").forEach((match) => {
      const terms = match.terms();
      if (terms.length > 2) {
        const petName = terms
          .slice(2)
          .map((t) => t.text())
          .join(" ")
          .trim();
        if (petName && nlp(petName).has("#ProperNoun")) {
          entities.pets.push(petName);
        }
      }
    });

    // Extract hobbies
    doc.match("(hobby|interest|passion) is *").forEach((match) => {
      const terms = match.terms();
      if (terms.length > 2) {
        const hobbyText = terms
          .slice(2)
          .map((t) => t.text())
          .join(" ")
          .trim();
        if (hobbyText) {
          entities.hobbies.push(hobbyText);
        }
      }
    });

    // Extract personality traits
    doc.match("(i am|i'm) a *").forEach((match) => {
      const terms = match.terms();
      const startIndex =
        terms.findIndex((t) => t.text().toLowerCase() === "a") + 1;

      if (startIndex > 0 && startIndex < terms.length) {
        const traitText = terms
          .slice(startIndex)
          .map((t) => t.text())
          .join(" ")
          .trim();
        if (traitText && nlp(traitText).has("#Adjective")) {
          entities.personality.push(traitText);
        }
      }
    });

    // Extract topics
    doc
      .nouns()
      .if("#Singular")
      .not("#Pronoun")
      .forEach((noun) => {
        const topic = noun.text();
        // Check it's not already in people or locations
        if (
          !entities.people.includes(topic) &&
          !entities.locations.includes(topic)
        ) {
          entities.topics.push(topic);
        }
      });

    // Limit topics to top 5
    entities.topics = entities.topics.slice(0, 5);

    // Log extracted entities
    const entityCounts = Object.entries(entities).reduce(
      (acc, [key, value]) => {
        acc[key] = value.length;
        return acc;
      },
      {}
    );

    logger.debug("Entity extraction completed", {
      userId,
      entityCounts,
      totalEntities: Object.values(entities).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
      operation: "analyzeAndExtractMemory",
    });

    // Check if we extracted any meaningful information
    const hasEntities = Object.values(entities).some((arr) => arr.length > 0);
    if (!hasEntities) {
      const totalDuration = Date.now() - startTime;
      logger.info("Memory analysis completed - no entities extracted", {
        userId,
        totalDuration: `${totalDuration}ms`,
        reason: "no meaningful entities found",
        operation: "analyzeAndExtractMemory",
      });
      return null;
    }

    // Check for personal context - we only want to save personal memories
    const isPersonal = doc.has("(my|I|we|our|me)");
    if (!isPersonal) {
      const totalDuration = Date.now() - startTime;
      logger.info("Memory analysis completed - not personal", {
        userId,
        totalDuration: `${totalDuration}ms`,
        reason: "message lacks personal context",
        hasEntities: true,
        entityCounts,
        operation: "analyzeAndExtractMemory",
      });
      return null;
    }

    // Create the memory object
    const newMemory = new Memory({
      userId,
      memory: message,
      ...entities,
      embedding: embedding,
    });

    const totalDuration = Date.now() - startTime;
    logger.info("Memory analysis completed successfully", {
      userId,
      totalDuration: `${totalDuration}ms`,
      memoryCreated: true,
      entityCounts,
      sentimentScore: sentimentResult.score,
      operation: "analyzeAndExtractMemory",
    });

    return newMemory;
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    logger.error("Memory analysis failed", {
      error: error.message,
      stack: error.stack,
      userId,
      messageLength: message?.length || 0,
      totalDuration: `${totalDuration}ms`,
      operation: "analyzeAndExtractMemory",
    });
    return null;
  }
};

/**
 * Fetches memories relevant to the current message
 * @param {string} userId - The user ID
 * @param {string} message - The current message to find relevant memories for
 * @param {Object} options - Configuration options
 * @param {number} [options.minRelevanceScore=1.5] - Absolute minimum relevance score to include a memory
 * @param {number} [options.relativeToBestRatio=0.3] - Only include memories with scores at least this ratio of the best score
 * @param {number} [options.maxMemories=3] - Maximum number of memories to return
 * @returns {Promise<Array>} - Array of relevant memory objects
 */
export const fetchRelevantMemories = async (userId, message, options = {}) => {
  const startTime = Date.now();

  // Default options
  const {
    minRelevanceScore = 1.5,
    relativeToBestRatio = 0.3,
    maxMemories = 3,
  } = options;

  logger.info("Memory retrieval started", {
    userId,
    messageLength: message?.length || 0,
    options: {
      minRelevanceScore,
      relativeToBestRatio,
      maxMemories,
    },
    operation: "fetchRelevantMemories",
  });

  try {
    // Process the message with compromise
    const nlpStartTime = Date.now();
    const doc = nlp(message);
    const nlpDuration = Date.now() - nlpStartTime;

    logger.debug("NLP processing completed for memory retrieval", {
      userId,
      nlpDuration: `${nlpDuration}ms`,
      operation: "fetchRelevantMemories",
    });

    // Create a results array to track all potential matches with relevance scores
    let potentialMatches = [];

    // Extract entities for targeted searches
    const people = doc.people().out("array");
    const places = doc.places().out("array");
    const nouns = doc.nouns().out("array");
    const topics = [
      ...new Set([...nouns, ...doc.match("#Singular").out("array")]),
    ].filter((t) => t.length > 2);

    logger.debug("Entities extracted for memory search", {
      userId,
      peopleCount: people.length,
      placesCount: places.length,
      topicsCount: topics.length,
      people: people.slice(0, 3), // Log first 3 for debugging
      places: places.slice(0, 3),
      topics: topics.slice(0, 5),
      operation: "fetchRelevantMemories",
    });

    // STEP 1: Entity-specific search
    const entityQueries = [];

    if (people.length > 0) {
      entityQueries.push({ userId, people: { $in: people } });
    }

    if (places.length > 0) {
      entityQueries.push({ userId, locations: { $in: places } });
    }

    if (topics.length > 0) {
      entityQueries.push({ userId, topics: { $in: topics } });
    }

    // Execute entity-specific search
    if (entityQueries.length > 0) {
      const entitySearchStart = Date.now();
      const entityResults = await Memory.find({ $or: entityQueries })
        .sort({ createdAt: -1 })
        .limit(10);
      const entitySearchDuration = Date.now() - entitySearchStart;

      logger.debug("Entity search completed", {
        userId,
        entitySearchDuration: `${entitySearchDuration}ms`,
        resultCount: entityResults.length,
        queryCount: entityQueries.length,
        operation: "fetchRelevantMemories",
      });

      entityResults.forEach((memory) => {
        // Calculate relevance score - higher priority for entity matches
        let score = 3.0; // Base score for entity matches

        // Boost score based on entity type matches
        if (people.some((p) => memory.people.includes(p))) score += 2;
        if (places.some((p) => memory.locations.includes(p))) score += 1.5;
        if (topics.some((t) => memory.topics.includes(t))) score += 1;

        // Recency boost (diminishing over time)
        const ageInDays =
          (Date.now() - new Date(memory.createdAt).getTime()) /
          (1000 * 3600 * 24);
        score += Math.max(0, 1 - ageInDays / 30); // Recency boost diminishes over 30 days

        potentialMatches.push({
          memory,
          score,
          matchType: "entity",
          explanation: `Entity match: found specific people, places or topics`,
        });
      });
    }

    // STEP 2: Build semantic search terms
    const searchTerms = [
      ...people,
      ...places,
      ...topics,
      ...doc.adjectives().out("array"),
      ...doc.verbs().out("array"),
    ]
      .filter((term) => term.length > 2) // Filter out short terms
      .filter((term, index, self) => self.indexOf(term) === index); // Remove duplicates

    // If we have search terms, use text search
    if (searchTerms.length > 0) {
      const textSearchStart = Date.now();
      const searchString = searchTerms.join(" ");

      logger.debug("Starting text search", {
        userId,
        searchString:
          searchString.substring(0, 100) +
          (searchString.length > 100 ? "..." : ""),
        searchTermsCount: searchTerms.length,
        operation: "fetchRelevantMemories",
      });

      const textSearchResults = await Memory.find(
        {
          userId,
          $text: { $search: searchString },
        },
        {
          score: { $meta: "textScore" },
        }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(10);

      const textSearchDuration = Date.now() - textSearchStart;

      logger.debug("Text search completed", {
        userId,
        textSearchDuration: `${textSearchDuration}ms`,
        resultCount: textSearchResults.length,
        operation: "fetchRelevantMemories",
      });

      textSearchResults.forEach((memory) => {
        // MongoDB text search already gives us a score, let's adapt it
        const textScore = memory._doc.score || 1.0;

        // Adjusted score based on text search + recency
        const ageInDays =
          (Date.now() - new Date(memory.createdAt).getTime()) /
          (1000 * 3600 * 24);
        const recencyBoost = Math.max(0, 1 - ageInDays / 30);

        const finalScore = textScore * 1.5 + recencyBoost;

        potentialMatches.push({
          memory,
          score: finalScore,
          matchType: "text",
          explanation: `Text match with score ${textScore.toFixed(2)}`,
        });
      });
    }

    // STEP 3: Detect emotional content for emotion-based matching
    const sentimentStartTime = Date.now();
    const sentimentResult = sentimentAnalyzer.analyze(message);
    const sentimentDuration = Date.now() - sentimentStartTime;

    logger.debug("Sentiment analysis for memory retrieval", {
      userId,
      sentimentScore: sentimentResult.score,
      sentimentDuration: `${sentimentDuration}ms`,
      operation: "fetchRelevantMemories",
    });

    let emotionQuery = null;
    let emotionType = "neutral";

    if (sentimentResult.score > 2) {
      emotionType = "positive";
      emotionQuery = {
        userId,
        emotions: { $in: ["positive", "happy", "excited", "joyful"] },
      };
    } else if (sentimentResult.score < -2) {
      emotionType = "negative";
      emotionQuery = {
        userId,
        emotions: { $in: ["negative", "sad", "angry", "anxious"] },
      };
    }

    if (emotionQuery) {
      const emotionSearchStart = Date.now();
      const emotionResults = await Memory.find(emotionQuery)
        .sort({ createdAt: -1 })
        .limit(5);
      const emotionSearchDuration = Date.now() - emotionSearchStart;

      logger.debug("Emotion search completed", {
        userId,
        emotionType,
        emotionSearchDuration: `${emotionSearchDuration}ms`,
        resultCount: emotionResults.length,
        operation: "fetchRelevantMemories",
      });

      emotionResults.forEach((memory) => {
        const emotionScore = 1.0; // Base score for emotion matches

        // Recency boost (diminishing over time)
        const ageInDays =
          (Date.now() - new Date(memory.createdAt).getTime()) /
          (1000 * 3600 * 24);
        const recencyBoost = Math.max(0, 1 - ageInDays / 30);

        potentialMatches.push({
          memory,
          score: emotionScore + recencyBoost,
          matchType: "emotion",
          explanation: `Emotional match: ${emotionType}`,
        });
      });
    }

    // STEP 4: Remove duplicates, sort by score
    const uniqueMatches = [];
    const seenIds = new Set();

    for (const match of potentialMatches) {
      const memoryId = match.memory._id.toString();
      if (!seenIds.has(memoryId)) {
        uniqueMatches.push(match);
        seenIds.add(memoryId);
      } else {
        // If we've seen this memory before, update its score if this one is higher
        const existingIndex = uniqueMatches.findIndex(
          (m) => m.memory._id.toString() === memoryId
        );

        if (
          existingIndex >= 0 &&
          match.score > uniqueMatches[existingIndex].score
        ) {
          uniqueMatches[existingIndex] = match;
        }
      }
    }

    // Sort by score (descending)
    uniqueMatches.sort((a, b) => b.score - a.score);

    logger.debug("Memory deduplication and sorting completed", {
      userId,
      totalMatches: potentialMatches.length,
      uniqueMatches: uniqueMatches.length,
      duplicatesRemoved: potentialMatches.length - uniqueMatches.length,
      operation: "fetchRelevantMemories",
    });

    // STEP 5: Apply advanced relevance filtering
    let finalMatches = [];

    if (uniqueMatches.length > 0) {
      // Get the highest score for relative comparison
      const highestScore = uniqueMatches[0].score;
      const relativeThreshold = highestScore * relativeToBestRatio;

      // Calculate the effective threshold (take the higher of minimum and relative)
      const effectiveThreshold = Math.max(minRelevanceScore, relativeThreshold);

      logger.debug("Applying relevance filtering", {
        userId,
        highestScore: parseFloat(highestScore.toFixed(2)),
        relativeThreshold: parseFloat(relativeThreshold.toFixed(2)),
        effectiveThreshold: parseFloat(effectiveThreshold.toFixed(2)),
        candidateCount: uniqueMatches.length,
        operation: "fetchRelevantMemories",
      });

      // Apply the threshold and take up to maxMemories
      finalMatches = uniqueMatches
        .filter((match) => match.score >= effectiveThreshold)
        .slice(0, maxMemories);
    }

    // Log the selected memories with their scores
    const selectedMemoryDetails = finalMatches.map((match, idx) => ({
      rank: idx + 1,
      matchType: match.matchType,
      score: parseFloat(match.score.toFixed(2)),
      memoryPreview:
        match.memory.memory.substring(0, 50) +
        (match.memory.memory.length > 50 ? "..." : ""),
      memoryId: match.memory._id.toString(),
    }));

    const totalDuration = Date.now() - startTime;

    logger.info("Memory retrieval completed", {
      userId,
      totalDuration: `${totalDuration}ms`,
      selectedCount: finalMatches.length,
      candidateCount: uniqueMatches.length,
      searchStats: {
        entityQueries: entityQueries.length,
        textSearchTerms: searchTerms.length,
        emotionType: emotionType !== "neutral" ? emotionType : null,
      },
      selectedMemories: selectedMemoryDetails,
      operation: "fetchRelevantMemories",
    });

    // If no relevant memories were found, log this explicitly
    if (finalMatches.length === 0) {
      logger.info("No memories met relevance threshold", {
        userId,
        totalDuration: `${totalDuration}ms`,
        candidateCount: uniqueMatches.length,
        thresholdUsed: minRelevanceScore,
        operation: "fetchRelevantMemories",
      });
    }

    // Return only the Memory objects from matches above threshold
    return finalMatches.map((match) => match.memory);
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    logger.error("Memory retrieval failed", {
      error: error.message,
      stack: error.stack,
      userId,
      messageLength: message?.length || 0,
      totalDuration: `${totalDuration}ms`,
      options: {
        minRelevanceScore,
        relativeToBestRatio,
        maxMemories,
      },
      operation: "fetchRelevantMemories",
    });
    return [];
  }
};
