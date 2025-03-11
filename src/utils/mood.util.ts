// src/utils/mood.util.ts
type TimeframeType = "weekly" | "monthly" | "yearly";
type AverageData = { day?: number; month?: number; averageMood: number };

export const formatMoodData = (data: AverageData[], type: TimeframeType) => {
  // Map day of week numbers to names (1 = Sunday, 2 = Monday, etc.)
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // Map month numbers to names (1 = January, etc.)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Create a formatted object based on the type
  switch (type) {
    case "weekly":
      return data.map((item) => ({
        label: dayNames[item.day! - 1], // Adjust for 1-indexed days in MongoDB
        value: parseFloat(item.averageMood.toFixed(2)),
      }));
    case "monthly":
      return data.map((item) => ({
        label: `Day ${item.day}`,
        value: parseFloat(item.averageMood.toFixed(2)),
      }));
    case "yearly":
      return data.map((item) => ({
        label: monthNames[item.month! - 1],
        value: parseFloat(item.averageMood.toFixed(2)),
      }));
    default:
      return data;
  }
};
