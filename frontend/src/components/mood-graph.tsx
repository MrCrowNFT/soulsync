import { useState, useEffect, useCallback } from "react";
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
  ChartOptions,
} from "chart.js";
import api from "@/api/axios";

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

// Define types
type TimePeriod = "weekly" | "monthly" | "yearly";

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

interface MoodAPIResponse {
  success: boolean;
  data: {
    labels: string[];
    datasets: Dataset[];
  };
}

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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [moodData, setMoodData] = useState<ChartData>({
    labels: [],
    datasets: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to detect dark mode
  const detectDarkMode = useCallback(() => {
    return document.documentElement.classList.contains("dark");
  }, []);

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
  }, [detectDarkMode]);

  // Handle time period change
  const handleTimePeriodChange = useCallback(
    (newPeriod: TimePeriod) => {
      if (newPeriod !== timePeriod) {
        setTimePeriod(newPeriod);
      }
    },
    [timePeriod]
  );

  // Direct API call function
  const fetchMoodData = useCallback(async (period: TimePeriod) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`Directly fetching mood data for ${period}...`);

      const response = await api.get<MoodAPIResponse>(`/mood/${period}`);
      console.log("API response:", response);

      // The data is in response.data.data, not directly in response.data
      const responseData = response.data.data;

      // Format the data
      const formattedData: ChartData = {
        labels: responseData.labels || [],
        datasets: responseData.datasets || [],
      };

      console.log("Formatted data:", formattedData);

      // Check if there's actual data in the datasets
      const hasData = formattedData.datasets.some(
        (dataset) => dataset.data && dataset.data.length > 0
      );

      console.log("Has data:", hasData);

      // If there's no data, we'll still set the moodData but log it
      if (!hasData) {
        console.log("No data points found in the datasets");
      }

      setMoodData(formattedData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching mood data:", err);
      setError("Failed to load mood data");
      setIsLoading(false);
    }
  }, []);

  // Fetch data when component mounts or time period changes
  useEffect(() => {
    fetchMoodData(timePeriod);
  }, [timePeriod, fetchMoodData]);

  // Chart options with dark/light mode support
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: isDarkMode ? "#f3f4f6" : "#374151",
        },
      },
      title: {
        display: true,
        text: `${
          timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)
        } Mood Trends`,
        color: isDarkMode ? "#f3f4f6" : "#374151",
      },
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? "#4b5563" : "#e5e7eb",
        },
        ticks: {
          color: isDarkMode ? "#f3f4f6" : "#374151",
        },
      },
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: isDarkMode ? "#4b5563" : "#e5e7eb",
        },
        ticks: {
          color: isDarkMode ? "#f3f4f6" : "#374151",
        },
        title: {
          display: true,
          text: "Mood Level",
          color: isDarkMode ? "#f3f4f6" : "#374151",
        },
      },
    },
  };

  // Prepare chart data with dark/light mode styling
  const prepareChartData = (data: ChartData): ChartData => {
    return {
      labels: data.labels || [],
      datasets: (data.datasets || []).map((dataset) => ({
        ...dataset,
        borderColor: isDarkMode ? "#3b82f6" : "#2563eb",
        backgroundColor: isDarkMode
          ? "rgba(59, 130, 246, 0.2)"
          : "rgba(37, 99, 235, 0.2)",
      })),
    };
  };

  // Function to check if there's actual data in the datasets
  const hasActualData = useCallback((data: ChartData): boolean => {
    return data.datasets.some(
      (dataset) => dataset.data && dataset.data.length > 0
    );
  }, []);

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
      ) : !hasActualData(moodData) ? (
        <div className="w-full p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-lg">
          No mood data available for the selected time period. Try adding some
          mood entries first.
        </div>
      ) : (
        <div className="w-full max-w-6xl h-[400px] p-4 mx-auto bg-white dark:bg-gray-800 rounded-lg transition-colors duration-300">
          <Line options={chartOptions} data={prepareChartData(moodData)} />
        </div>
      )}
    </div>
  );
};

export default MoodGraph;
