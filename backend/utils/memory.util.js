import nlp from "compromise";
import Sentiment from "sentiment";
import { Memory } from "../models/memory.model.js";

// sentiment analyzer
const sentimentAnalyzer = new Sentiment();

/**
 * Analyzes a user message to determine if it contains memory-worthy information
 * @param {string} userId - The user ID
 * @param {string} message - The message to analyze
 * @returns {Promise<Memory|null>} - A Memory object or null if no memory was extracted
 */
export const analyzeAndExtractMemory = async (userId, message) => {
  try {
    // Process the message with compromise
    const doc = nlp(message);

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
    const sentimentResult = sentimentAnalyzer.analyze(message);

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

    // Extract likes - Fixed pattern matching
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

    // Extract dislikes - Fixed pattern matching
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

    // Extract goals - Fixed pattern matching
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

    // Extract pets - Fixed pattern matching
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

    // Extract hobbies - Fixed pattern matching
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

    // Extract personality traits - Fixed pattern matching
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

    // Check if we extracted any meaningful information
    const hasEntities = Object.values(entities).some((arr) => arr.length > 0);
    if (!hasEntities) return null;

    // Check for personal context - we only want to save personal memories
    const isPersonal = doc.has("(my|I|we|our|me)");
    if (!isPersonal) return null;

    // Create the memory object
    const newMemory = new Memory({
      userId,
      memory: message,
      ...entities,
    });

    return newMemory;
  } catch (error) {
    console.error("Error in memory analysis:", error);
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
  // Default options
  const {
    minRelevanceScore = 1.5,
    relativeToBestRatio = 0.3,
    maxMemories = 3,
  } = options;

  console.log("------ MEMORY RETRIEVAL STARTED ------");
  console.log(`User ID: ${userId}`);
  console.log(`Message: "${message}"`);
  console.log(`Min relevance threshold: ${minRelevanceScore}`);
  console.log(`Relative to best ratio: ${relativeToBestRatio}`);

  try {
    // Process the message with compromise
    const doc = nlp(message);
    console.log("NLP processing completed");

    // Create a results array to track all potential matches with relevance scores
    let potentialMatches = [];

    // Extract entities for targeted searches
    const people = doc.people().out("array");
    const places = doc.places().out("array");
    const nouns = doc.nouns().out("array");
    const topics = [
      ...new Set([...nouns, ...doc.match("#Singular").out("array")]),
    ].filter((t) => t.length > 2);

    console.log(
      `Entities found - People: ${people.length}, Places: ${places.length}, Topics: ${topics.length}`
    );

    // STEP 1: Entity-specific search
    const entityQueries = [];

    if (people.length > 0) {
      console.log(`Searching for people: ${people.join(", ")}`);
      entityQueries.push({ userId, people: { $in: people } });
    }

    if (places.length > 0) {
      console.log(`Searching for places: ${places.join(", ")}`);
      entityQueries.push({ userId, locations: { $in: places } });
    }

    if (topics.length > 0) {
      console.log(`Searching for topics: ${topics.join(", ")}`);
      entityQueries.push({ userId, topics: { $in: topics } });
    }

    // Execute entity-specific search
    if (entityQueries.length > 0) {
      console.log("Executing entity search query");
      const entityResults = await Memory.find({ $or: entityQueries })
        .sort({ createdAt: -1 })
        .limit(10);

      console.log(`Entity search found ${entityResults.length} memories`);

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
      const searchString = searchTerms.join(" ");
      console.log(`Text search using: ${searchString}`);

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

      console.log(`Text search found ${textSearchResults.length} memories`);

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
    const sentimentResult = sentimentAnalyzer.analyze(message);
    console.log(`Sentiment analysis score: ${sentimentResult.score}`);

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
      console.log(`Searching for ${emotionType} emotional memories`);
      const emotionResults = await Memory.find(emotionQuery)
        .sort({ createdAt: -1 })
        .limit(5);

      console.log(`Emotion search found ${emotionResults.length} memories`);

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

    // STEP 5: Apply advanced relevance filtering
    let finalMatches = [];

    if (uniqueMatches.length > 0) {
      // Get the highest score for relative comparison
      const highestScore = uniqueMatches[0].score;
      const relativeThreshold = highestScore * relativeToBestRatio;

      // Calculate the effective threshold (take the higher of minimum and relative)
      const effectiveThreshold = Math.max(minRelevanceScore, relativeThreshold);

      console.log(`Highest memory score: ${highestScore.toFixed(2)}`);
      console.log(
        `Effective relevance threshold: ${effectiveThreshold.toFixed(2)}`
      );

      // Apply the threshold and take up to maxMemories
      finalMatches = uniqueMatches
        .filter((match) => match.score >= effectiveThreshold)
        .slice(0, maxMemories);
    }

    // Log the selected memories with their scores
    console.log(
      `Selected ${finalMatches.length} memories after relevance filtering:`
    );

    finalMatches.forEach((match, idx) => {
      console.log(
        `${idx + 1}. [${match.matchType}] Score: ${match.score.toFixed(2)} - ${
          match.explanation
        }`
      );
      console.log(`   Memory: "${match.memory.memory.substring(0, 50)}..."`);
    });

    // If no relevant memories were found, log this explicitly
    if (finalMatches.length === 0) {
      console.log("No memories met the relevance threshold criteria");
    }

    console.log("------ MEMORY RETRIEVAL COMPLETED ------");

    // Return only the Memory objects from matches above threshold
    return finalMatches.map((match) => match.memory);
  } catch (error) {
    console.error("------ MEMORY RETRIEVAL FAILED ------");
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    return [];
  }
};
