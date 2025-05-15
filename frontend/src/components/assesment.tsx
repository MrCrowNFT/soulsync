import { FunctionComponent } from "react";
import { AssessmentProp } from "../../types/Assessment";

const Assessment: FunctionComponent<AssessmentProp> = ({ assessment }) => {
  const formattedTimestamp = new Date(assessment.timestamp).toLocaleString();

  return (
    <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded-lg ml-10 mr-10 p-6 transition-colors duration-300">
      {/* Title */}
      <h2 className="text-2xl font-mono font-semibold mb-2 text-gray-900 dark:text-gray-100">
        AI Assessment
      </h2>

      {/* Assessment Text */}
      <p className="text-gray-700 dark:text-gray-300 font-mono mb-4">
        {assessment.assessment}
      </p>

      {/* Button and Timestamp */}
      <div className="flex justify-between items-center mt-4">
        <button className="bg-blue-500 dark:bg-blue-600 font-mono text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-300">
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