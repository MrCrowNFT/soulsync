import { FunctionComponent, useEffect, useState } from "react";
import { Assessment as AssessmentType } from "@/types";
import { getAssesment } from "@/api/services";
import { ArrowUpRight, RefreshCw, TrendingDown, TrendingUp, Minus } from "lucide-react";

const Assessment: FunctionComponent = () => {
  const [assessment, setAssessment] = useState<AssessmentType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssesment();
      setAssessment(data);
    } catch (err) {
      setError("Failed to load your assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, []);

  // Function to render trend icon
  const renderTrendIcon = () => {
    if (!assessment) return <Minus size={20} />;
    
    switch (assessment.moodTrend) {
      case "improving":
        return <TrendingUp size={20} className="text-emerald-500" />;
      case "declining":
        return <TrendingDown size={20} className="text-orange-500" />;
      default:
        return <Minus size={20} className="text-gray-500" />;
    }
  };

  // Function to map mood average to color
  const getMoodColor = () => {
    if (!assessment) return "bg-gray-200 dark:bg-gray-700";
    
    if (assessment.moodAverage >= 4) {
      return "bg-emerald-500";
    } else if (assessment.moodAverage >= 3) {
      return "bg-blue-500";
    } else if (assessment.moodAverage >= 2) {
      return "bg-yellow-500";
    } else {
      return "bg-orange-500";
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
      {/* Title */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-outfit font-semibold text-gray-900 dark:text-gray-100">
          AI Assessment
        </h2>
        <button 
          onClick={fetchAssessment}
          disabled={loading}
          className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-300"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading assessment...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && assessment && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Mood Average */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Mood Average</div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${getMoodColor()}`}></div>
                <span className="text-lg font-semibold">{assessment.moodAverage.toFixed(1)}</span>
              </div>
            </div>
            
            {/* Mood Trend */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Trend</div>
              <div className="flex items-center">
                {renderTrendIcon()}
                <span className="text-lg font-semibold ml-2 capitalize">{assessment.moodTrend}</span>
              </div>
            </div>
            
            {/* Timeframe */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Timeframe</div>
              <div className="text-lg font-semibold">{assessment.timeframe}</div>
            </div>
          </div>

          {/* Assessment Text */}
          <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 rounded-lg p-5 mb-6">
            <p className="text-gray-700 dark:text-gray-300 font-inter leading-relaxed">
              {assessment.assessment}
            </p>
          </div>

          {/* Data Summary */}
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            <div>Based on {assessment.moodEntriesCount} mood entries</div>
            <div>{assessment.memoriesCount} memories analyzed</div>
          </div>

          {/* Button */}
          <div className="flex justify-between items-center mt-6">
            <button className="bg-primary-500 dark:bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-300 flex items-center font-medium">
              Get Detailed Report
              <ArrowUpRight size={16} className="ml-2" />
            </button>
            <p className="italic text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Assessment;
