import { FunctionComponent, useState } from "react";
import { Assessment as AssessmentType } from "@/types";
import { getAssesment } from "@/api/services";

const Assessment: FunctionComponent = () => {
  const [assessment, setAssessment] = useState<AssessmentType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssesment();
      setAssessment(data);
    } catch (err) {
      setError("Failed to load assessment. Please try again.");
      console.error("Assessment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
      {/* Title */}
      <h2 className="text-2xl font-mono font-semibold mb-4 text-gray-900 dark:text-gray-100">
        AI Assessment
      </h2>

      {/* Assessment content or placeholder */}
      <div className="mb-6">
        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            Loading your assessment...
          </div>
        ) : assessment ? (
          <>
            {/* Assessment Text */}
            <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 font-mono">
                <i>
                  {assessment.assessment ||
                    "Not enough data for assessment. Please track your mood and add memories for at least 3 days."}
                </i>
              </p>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <p>
              <i>
                Click the button below to get an AI assessment of your mood and
                recent behaviour.
              </i>
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <div className="mb-4 text-red-500 text-center">{error}</div>}

      {/* Button at bottom right */}
      <div className="flex justify-end">
        <button
          onClick={fetchAssessment}
          disabled={loading}
          className="bg-blue-500 dark:bg-blue-600 font-mono text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? "Loading..." : "New Assessment"}
        </button>
      </div>
    </div>
  );
};

export default Assessment;
