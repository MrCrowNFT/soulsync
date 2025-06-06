import { useState, useCallback, memo } from "react";
import { useProfile } from "@/hooks/use-profile";
import { moods } from "@/data/moods";

interface MoodTrackerProps {
  onMoodSubmit?: () => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodSubmit }) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Use primitive selectors instead of object destructuring to prevent unnecessary re-renders
  const newMood = useProfile((state) => state.newMood);
  const username = useProfile((state) => state.username);
  const userId = useProfile((state) => state._id);

  // Derive isAuthenticated from the selected values
  const isAuthenticated = !!username && !!userId;

  const handleChange = (moodValue: number): void => {
    setSelectedMood(moodValue);
  };

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (selectedMood !== null && isAuthenticated) {
      setLocalLoading(true);
      setLocalError(null);

      try {
        const success = await newMood(selectedMood);

        if (success) {
          setIsSubmitted(true);

          // Call the onMoodSubmit callback if provided
          if (onMoodSubmit) {
            onMoodSubmit();
          }

          // Hide the tracker for 30 minutes
          setTimeout(() => {
            setIsSubmitted(false);
            setSelectedMood(null);
          }, 1800000);
        } else {
          setLocalError("Failed to submit mood");
        }
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLocalLoading(false);
      }
    } else if (!isAuthenticated) {
      setLocalError("You must be logged in to track your mood");
    }
  }, [selectedMood, newMood, isAuthenticated, onMoodSubmit]);

  if (isSubmitted) {
    return (
      <div className="mt-5 flex w-full items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-blue-400 bg-white p-6 text-center text-gray-800 shadow-md transition-colors duration-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          <p>Thanks for sharing how you feel! We'll check back later.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-5 flex w-full items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-blue-400 bg-white p-6 text-center text-gray-800 shadow-md transition-colors duration-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          <p>Please log in to track your mood</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 flex w-full items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-blue-400 bg-white p-6 text-gray-800 shadow-md transition-colors duration-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
        <h2 className="mb-4 text-center text-xl font-semibold">
          How are you feeling today?
        </h2>

        <div className="mb-6 flex items-center justify-between px-2">
          {moods.map((mood) => {
            const IconComponent = mood.icon;
            return (
              <label
                key={mood.value}
                className="flex cursor-pointer flex-col items-center"
              >
                <input
                  type="radio"
                  name="mood"
                  value={mood.value}
                  checked={selectedMood === mood.value}
                  onChange={() => handleChange(mood.value)}
                  className="hidden"
                />
                <div
                  className={`rounded-full p-3 transition-all duration-200 ${
                    selectedMood === mood.value
                      ? `${mood.color} scale-110 bg-gray-100 ring-2 ring-blue-400 ring-offset-2 dark:bg-gray-700`
                      : `${mood.color} hover:scale-105`
                  }`}
                >
                  <IconComponent size={28} />
                </div>
                <span className="mt-2 text-center text-xs">{mood.label}</span>
              </label>
            );
          })}
        </div>

        {localError && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-red-800 dark:bg-red-900 dark:text-red-100">
            <p>{localError}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            disabled={selectedMood === null || localLoading}
            className={`rounded-md px-6 py-2 font-medium transition-colors duration-200 ${
              selectedMood === null || localLoading
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "cursor-pointer bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            }`}
          >
            {localLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(MoodTracker);
