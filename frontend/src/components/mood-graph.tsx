import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useProfile } from "@/hooks/use-profile"; 

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Button component for time period selection
const TimeButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md mr-2 transition-colors ${
      active
        ? "bg-blue-500 text-white dark:bg-blue-600"
        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
    }`}
  >
    {children}
  </button>
);

const MoodGraph = () => {
  // Time period state
  const [timePeriod, setTimePeriod] = useState<"weekly" | "monthly" | "yearly">(
    "weekly"
  );

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Get data and functions from Zustand 
  const { moodData, getMoods, isLoading, error } = useProfile();

  // Function to detect dark mode
  const detectDarkMode = () => {
    return document.documentElement.classList.contains("dark");
  };

  // Update dark mode state when the theme changes
  useEffect(() => {
    const handleDarkModeChange = () => {
      setIsDarkMode(detectDarkMode());
    };

    // Initial check
    handleDarkModeChange();

    // Listen for changes to the dark mode class
    const observer = new MutationObserver(handleDarkModeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  // Fetch data on component mount and when time period changes
  useEffect(() => {
    getMoods(timePeriod);
  }, [timePeriod, getMoods]);

  // Handle time period change
  const handleTimePeriodChange = (
    newPeriod: "weekly" | "monthly" | "yearly"
  ) => {
    setTimePeriod(newPeriod);
  };

  // Apply dark mode styles to the chart
  const darkModeStyles = {
    backgroundColor: "#1f2937", // Dark background
    borderColor: "#4b5563", // Dark border
    color: "#f3f4f6", // Light text
  };

  const lightModeStyles = {
    backgroundColor: "#ffffff", // Light background
    borderColor: "#e5e7eb", // Light border
    color: "#374151", // Dark text
  };

  // Chart options with dark/light mode support
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: isDarkMode ? darkModeStyles.color : lightModeStyles.color,
        },
      },
      title: {
        display: true,
        text: `${
          timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)
        } Mood Trends`,
        color: isDarkMode ? darkModeStyles.color : lightModeStyles.color,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode
            ? darkModeStyles.borderColor
            : lightModeStyles.borderColor,
        },
        ticks: {
          color: isDarkMode ? darkModeStyles.color : lightModeStyles.color,
        },
      },
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: isDarkMode
            ? darkModeStyles.borderColor
            : lightModeStyles.borderColor,
        },
        ticks: {
          color: isDarkMode ? darkModeStyles.color : lightModeStyles.color,
        },
        title: {
          display: true,
          text: "Mood Level",
          color: isDarkMode ? darkModeStyles.color : lightModeStyles.color,
        },
      },
    },
  };

  // Prepare chart data with dark/light mode styling
  const chartData = {
    labels: moodData.labels,
    datasets: moodData.datasets.map((dataset) => ({
      ...dataset,
      borderColor: isDarkMode ? "#3b82f6" : "#2563eb", 
      backgroundColor: isDarkMode
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(37, 99, 235, 0.2)", 
    })),
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full flex justify-center mb-4 mt-4">
        <TimeButton
          active={timePeriod === "weekly"}
          onClick={() => handleTimePeriodChange("weekly")}
        >
          Weekly
        </TimeButton>
        <TimeButton
          active={timePeriod === "monthly"}
          onClick={() => handleTimePeriodChange("monthly")}
        >
          Monthly
        </TimeButton>
        <TimeButton
          active={timePeriod === "yearly"}
          onClick={() => handleTimePeriodChange("yearly")}
        >
          Yearly
        </TimeButton>
      </div>

      {isLoading ? (
        <div className="w-full h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="w-full p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          Error loading mood data: {error}
        </div>
      ) : moodData.labels.length === 0 ? (
        <div className="w-full p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-lg">
          No mood data available for the selected time period.
        </div>
      ) : (
        <div className="w-full md:w-1/2 p-4 ml-10 mr-10 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300 h-64">
          <Line options={chartOptions} data={chartData} />
        </div>
      )}
    </div>
  );
};

export default MoodGraph;
