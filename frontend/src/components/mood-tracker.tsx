import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { moods } from "@/data/moods";

const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Get newMood and loading state from the profile store
  const { newMood, isLoading, error } = useProfile((state) => ({
    newMood: state.newMood,
    isLoading: state.isLoading,
    error: state.error,
  }));

  const handleChange = (moodValue: number): void => {
    setSelectedMood(moodValue);
  };

  const handleSubmit = async (): Promise<void> => {
    if (selectedMood !== null) {
      // Use the newMood method from the profile store
      const success = await newMood(selectedMood);

      if (success) {
        setIsSubmitted(true);

        // Hide the tracker for 30 minutes (1800000 ms)
        setTimeout(() => {
          setIsSubmitted(false);
          setSelectedMood(null);
        }, 1800000);

        console.log(`Mood submitted: ${selectedMood}`);
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="mt-5 flex w-full items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-blue-400 bg-white p-6 text-center text-gray-800 shadow-md transition-colors duration-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          <p>Thanks for sharing how you feel! We'll check back later.</p>
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

        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-red-800 dark:bg-red-900 dark:text-red-100">
            <p>{error}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            disabled={selectedMood === null || isLoading}
            className={`rounded-md px-6 py-2 font-medium transition-colors duration-200 ${
              selectedMood === null || isLoading
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "cursor-pointer bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
