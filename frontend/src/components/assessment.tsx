import { FunctionComponent, useEffect, useState } from "react";
import { Assessment as AssessmentType } from "@/types";
import { getAssesment } from "../axios";

const Assessment: FunctionComponent = () => {
  const [assessment, setAssessment] = useState<AssessmentType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const data = await getAssesment();
      setAssessment(data);
    } catch (err) {
      console.error("Failed to load assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, []);

  // Format the current date for display
  const formattedTimestamp = new Date().toLocaleString();

  if (loading) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">
          Loading assessment...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
      {/* Title */}
      <h2 className="text-2xl font-mono font-semibold mb-4 text-gray-900 dark:text-gray-100">
        AI Assessment
      </h2>

      {assessment && (
        <>
          {/* Timeframe */}
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Analysis period:{" "}
            <span className="font-semibold">{assessment.timeframe}</span>
          </div>

          {/* Mood Stats */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Average Mood
                </p>
                <p className="text-lg font-semibold">
                  {assessment.moodAverage.toFixed(1)}/5
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Trend
                </p>
                <p className="text-lg font-semibold capitalize">
                  {assessment.moodTrend}
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Based on {assessment.moodEntriesCount} entries •{" "}
              {assessment.memoriesCount} memories
            </div>
          </div>

          {/* Assessment Text */}
          <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 rounded-lg p-4 mb-6">
            <p className="text-gray-700 dark:text-gray-300 font-mono">
              {assessment.assessment}
            </p>
          </div>
        </>
      )}

      {/* Button and Timestamp */}
      <div className="flex justify-between items-center mt-auto">
        <button
          onClick={fetchAssessment}
          className="bg-blue-500 dark:bg-blue-600 font-mono text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-300"
        >
          New Assessment
        </button>
        <p className="italic text-sm text-gray-500 dark:text-gray-400">
          {formattedTimestamp}
        </p>
      </div>
    </div>
  );
};

export default Assessment;
