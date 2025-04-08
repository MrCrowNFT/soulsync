export const formatMoodData = (averages, type) => {
  const labels = averages.map((entry) => {
    if (type === "weekly") return `Day ${entry.day}`;
    if (type === "monthly") return `Day ${entry.day}`;
    if (type === "yearly") return `Month ${entry.month}`;
    return "";
  });

  const data = averages.map((entry) => entry.averageMood);

  return {
    labels,
    datasets: [
      {
        label: "Mood",
        data,
        borderColor: "#3b82f6", // line color -> up for change
        backgroundColor: "rgba(59, 130, 246, 0.2)", // fill color-> up for change
      },
    ],
  };
};
