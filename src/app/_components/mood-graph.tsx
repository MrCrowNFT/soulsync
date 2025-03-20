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
import { FunctionComponent, useEffect, useState } from "react";
import type { LineProp } from "@/types/graph";

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

const MoodGraph: FunctionComponent<LineProp> = ({ data }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const chartOptions = {
    ...data.options,
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
        grid: {
          color: isDarkMode
            ? darkModeStyles.borderColor
            : lightModeStyles.borderColor,
        },
        ticks: {
          color: isDarkMode ? darkModeStyles.color : lightModeStyles.color,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? darkModeStyles.color : lightModeStyles.color,
        },
      },
      title: {
        color: isDarkMode ? darkModeStyles.color : lightModeStyles.color,
      },
    },
  };

  const chartData = {
    ...data.data,
    datasets: data.data.datasets.map((dataset) => ({
      ...dataset,
      borderColor: isDarkMode ? "#3b82f6" : "#2563eb", // Adjust line color for dark mode
      backgroundColor: isDarkMode
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(37, 99, 235, 0.2)", // Adjust fill color for dark mode
    })),
  };

  return (
    <div className="w-full md:w-1/2 p-4 ml-10 mr-10 bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
      <Line options={chartOptions} data={chartData} />
    </div>
  );
};

export default MoodGraph;
