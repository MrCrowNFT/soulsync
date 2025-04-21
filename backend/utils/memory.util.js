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
 * @returns {Promise<Array>} - Array of relevant memory objects
 */
export const fetchRelevantMemories = async (userId, message) => {
  try {
    // Process the message with compromise
    const doc = nlp(message);

    // Extract entities for targeted searches
    const people = doc.people().out("array");
    const places = doc.places().out("array");
    const nouns = doc.nouns().out("array");

    // Create search queries - first try exact entity matches
    const queries = [];

    if (people.length > 0) {
      queries.push({ userId, people: { $in: people } });
    }

    if (places.length > 0) {
      queries.push({ userId, locations: { $in: places } });
    }

    // Execute entity-specific search
    if (queries.length > 0) {
      const entityResults = await Memory.find({ $or: queries })
        .sort({ createdAt: -1 })
        .limit(5);

      if (entityResults.length > 0) {
        return entityResults;
      }
    }

    // Build semantic search terms
    const searchTerms = [
      ...people,
      ...places,
      ...nouns,
      ...doc.adjectives().out("array"),
      ...doc.verbs().out("array"),
    ]
      .filter((term) => term.length > 2) // Filter out short terms
      .filter((term, index, self) => self.indexOf(term) === index); // Remove duplicates

    // If we have search terms, use text search
    if (searchTerms.length > 0) {
      const searchString = searchTerms.join(" ");

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
        .limit(5);

      if (textSearchResults.length > 0) {
        return textSearchResults;
      }
    }

    // Detect emotional content for emotion-based matching
    const sentimentResult = sentimentAnalyzer.analyze(message);
    let emotionQuery = null;

    if (sentimentResult.score > 2) {
      emotionQuery = {
        userId,
        emotions: { $in: ["positive", "happy", "excited", "joyful"] },
      };
    } else if (sentimentResult.score < -2) {
      emotionQuery = {
        userId,
        emotions: { $in: ["negative", "sad", "angry", "anxious"] },
      };
    }

    if (emotionQuery) {
      const emotionResults = await Memory.find(emotionQuery)
        .sort({ createdAt: -1 })
        .limit(3);

      if (emotionResults.length > 0) {
        return emotionResults;
      }
    }

    // Last resort: recent memories
    return await Memory.find({ userId }).sort({ createdAt: -1 }).limit(3);
  } catch (error) {
    console.error("Error fetching relevant memories:", error);
    return [];
  }
};
