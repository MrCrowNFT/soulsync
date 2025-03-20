import { FunctionComponent } from "react";
import type { AssessmentProp } from "@/types/assessmentssessment";

const Assessment: FunctionComponent<AssessmentProp> = ({ assessment }) => {
  const formattedTimestamp = new Date(assessment.timestamp).toLocaleString();

  return (
    <div className="ml-10 mr-10 w-full rounded-lg bg-white p-6 transition-colors duration-300 dark:bg-gray-800 md:w-1/2">
      {/* Title */}
      <h2 className="mb-2 font-mono text-2xl font-semibold text-gray-900 dark:text-gray-100">
        AI Assessment
      </h2>

      {/* Assessment Text */}
      <p className="mb-4 font-mono text-gray-700 dark:text-gray-300">
        {assessment.assessment}
      </p>

      {/* Button and Timestamp */}
      <div className="mt-4 flex items-center justify-between">
        <button className="rounded-lg bg-blue-500 px-4 py-2 font-mono text-white transition-colors duration-300 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
          New Assessment
        </button>
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          {formattedTimestamp}
        </p>
      </div>
    </div>
  );
};

export default Assessment;
