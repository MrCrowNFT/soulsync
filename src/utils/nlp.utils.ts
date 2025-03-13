import nlp from "compromise";
import { NLPResult } from "@/types/memory";

// Common pet types for detection
const petNames = [
  "dog",
  "cat",
  "parrot",
  "rabbit",
  "hamster",
  "fish",
  "turtle",
  "guinea pig",
  "bird",
];

// Common emotion words for detection
const emotionWords: Record<string, string[]> = {
  happy: [
    "happy",
    "joyful",
    "excited",
    "pleased",
    "delighted",
    "content",
    "glad",
    "thrilled",
    "enjoy",
    "love",
    "great",
  ],
  sad: [
    "sad",
    "depressed",
    "unhappy",
    "down",
    "gloomy",
    "miserable",
    "upset",
    "disappointed",
    "heartbroken",
  ],
  angry: [
    "angry",
    "frustrated",
    "annoyed",
    "mad",
    "furious",
    "irritated",
    "upset",
    "hate",
    "dislike",
  ],
  surprised: [
    "surprised",
    "shocked",
    "amazed",
    "astonished",
    "stunned",
    "wow",
    "unexpected",
  ],
  scared: [
    "scared",
    "afraid",
    "frightened",
    "terrified",
    "anxious",
    "nervous",
    "worried",
    "fear",
  ],
  loved: ["loved", "adored", "cherished", "appreciated", "cared"],
};

// Simple sentiment analysis function
function analyzeSentiment(text: string): string | null {
  const lowerText = text.toLowerCase();

  // Count positive and negative words
  const positiveWords = [
    "good",
    "great",
    "happy",
    "glad",
    "excellent",
    "wonderful",
    "amazing",
    "love",
    "nice",
    "enjoy",
  ];
  const negativeWords = [
    "bad",
    "sad",
    "upset",
    "terrible",
    "horrible",
    "awful",
    "hate",
    "dislike",
    "angry",
    "poor",
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveCount++;
  });

  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeCount++;
  });

  if (positiveCount > negativeCount) return "happy";
  if (negativeCount > positiveCount) return "sad";
  return null;
}

// NLP processor function to extract entities
export function processWithNLP(message: string): NLPResult {
  // Process with Compromise.js
  const doc = nlp(message);

  // Extract people
  const people = doc.people().out("array") as string[];

  // Extract locations
  const locations = doc.places().out("array") as string[];

  // Extract potential topics (nouns, proper nouns, and hashtags)
  const ignoredTopics = ["thing", "stuff", "day", "year", "time", "person"];
  const topics = [
    ...new Set([
      ...(doc.nouns().not("#Pronoun").out("array") as string[]),
      ...(doc.hashTags().out("array") as string[]).map((tag) =>
        tag.replace("#", ""),
      ),
    ]),
  ]
    .filter((topic) => !ignoredTopics.includes(topic.toLowerCase()))
    .slice(0, 10); // Limit to 10 topics

  // Extract pets
  const lowerMessage = message.toLowerCase();
  const pets = petNames.filter((pet) => {
    const regex = new RegExp(`\\b${pet}\\b`, "i"); // Match whole words, case insensitive
    return regex.test(lowerMessage);
  });

  // Extract emotions using text matching
  const emotions: string[] = [];

  // Check for emotion words
  Object.entries(emotionWords).forEach(([emotion, words]) => {
    for (const word of words) {
      if (lowerMessage.includes(word)) {
        emotions.push(emotion);
        break; // Only add each emotion category once
      }
    }
  });

  // Add basic sentiment analysis as fallback emotion if no specific emotions detected
  if (emotions.length === 0) {
    const sentiment = analyzeSentiment(message);
    if (sentiment) emotions.push(sentiment);
  }

  return {
    people,
    locations,
    topics,
    pets,
    emotions: [...new Set(emotions)], // Remove duplicates
  };
}
