import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MoodGraph from "@/components/mood-graph";
import UserCard from "@/components/user-card";
import { useProfile } from "@/hooks/use-profile";
import Assessment from "@/components/assessment";

const Dashboard = () => {
  const navigate = useNavigate();
  const username = useProfile((state) => state.username);
  const isLoading = useProfile((state) => state.isLoading);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication status once component mounts
  useEffect(() => {
    // Only set authChecked to true after we've confirmed the auth state
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  // Show loading state while checking authentication
  if (isLoading || !authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login required message if no user
  if (!username) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-center text-2xl font-semibold text-gray-800 dark:text-white">
            Login Required
          </h2>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
            You need to be logged in to view this dashboard.
          </p>
          <div className="text-center">
            <button
              onClick={() => navigate("/login")}
              className="rounded-md bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard content if authenticated
  return (
    <div className="container mx-auto px-4 py-8 mb-24">
      <h1 className="mb-8 text-2xl font-bold text-gray-800 dark:text-white">
        Your Dashboard
      </h1>
      <UserCard />

      {/* Mood Graph and Assessment Section */}
      <div className="mt-8 mb-16 w-full max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mood Graph */}
          <div className="w-full lg:w-2/3 h-96 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <MoodGraph />
          </div>

          {/* Assessment  */}
          <div className="w-full lg:w-1/3">
            <Assessment />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
