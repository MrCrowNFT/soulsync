import { useState, useEffect, useCallback, useRef } from "react";
import { PaperclipIcon, SendIcon, ImageIcon, SmileIcon } from "lucide-react";
import MoodTracker from "./mood-tracker";
import { useProfile } from "@/hooks/use-profile";

const Chat: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [showMoodTracker, setShowMoodTracker] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Use a ref to track if we've already initiated the fetch
  const chatFetchedRef = useRef<boolean>(false);

  // Get profile data with memoized selector to prevent unnecessary re-renders
  const { chat, newChat, getChat, isLoading, error, username } = useProfile(
    (state) => ({
      chat: state.chat,
      newChat: state.newChat,
      getChat: state.getChat,
      isLoading: state.isLoading,
      error: state.error,
      username: state.username,
    })
  );

  // Load chat history only once when component mounts if user is logged in
  useEffect(() => {
    // Only execute if username exists, we haven't initialized yet, and haven't fetched chat
    if (username && !isInitialized && !chatFetchedRef.current) {
      chatFetchedRef.current = true; // Mark as fetched to prevent repeat calls

      const loadChat = async () => {
        try {
          await getChat();
          setIsInitialized(true);
        } catch (err) {
          console.error("Failed to load chat:", err);
          setIsInitialized(true); // Still mark as initialized even if it fails
        }
      };

      loadChat();
    } else if (!username) {
      // If no username, still mark as initialized to prevent future fetch attempts
      setIsInitialized(true);
    }
  }, [username, getChat, isInitialized]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && username) {
        try {
          await newChat(input.trim());
          setInput("");
          setShowMoodTracker(false);
        } catch (err) {
          console.error("Failed to send message:", err);
        }
      }
    },
    [input, username, newChat]
  );

  const formatTime = useCallback((date: Date): string => {
    if (!date) return "";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return (
    <div className="mx-auto mt-5 flex w-full max-w-2xl flex-col items-center rounded-xl bg-white p-6 shadow-md transition-colors duration-300 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-4 w-full border-b border-gray-200 pb-3 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Chat Assistant
        </h2>
      </div>

      {/* Messages Container */}
      <div className="mb-6 h-[500px] w-full overflow-y-auto rounded-xl border border-blue-300 bg-gray-50 p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700">
        {showMoodTracker && username && <MoodTracker />}

        <div className="flex flex-col space-y-4">
          {chat && chat.length > 0 ? (
            chat.map((entry, index) => (
              <div
                key={entry._id || `message-${index}`}
                className={`flex ${
                  entry.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                    entry.sender === "user"
                      ? "rounded-tr-none bg-blue-500 text-white"
                      : "rounded-tl-none bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-100"
                  }`}
                >
                  {/* Display sender information */}
                  <p
                    className={`text-xs font-semibold mb-1 ${
                      entry.sender === "user"
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {entry.sender === "user" ? username : "Assistant"}
                  </p>

                  <p>{entry.message}</p>

                  {entry.createdAt && (
                    <p
                      className={`mt-1 text-xs ${
                        entry.sender === "user"
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {formatTime(entry.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : !showMoodTracker ? (
            <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
              <p>
                {username
                  ? "Start a conversation..."
                  : "Please log in to start chatting"}
              </p>
            </div>
          ) : !username ? (
            <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
              <p>Please log in to start chatting</p>
            </div>
          ) : null}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-tl-none bg-white px-4 py-2 text-gray-800 shadow-sm dark:bg-gray-600 dark:text-gray-100">
                <p className="text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">
                  Assistant
                </p>
                <p>Thinking...</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <div className="rounded-2xl bg-red-100 px-4 py-2 text-red-800 shadow-sm dark:bg-red-900 dark:text-red-100">
                <p>Error: {error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
        {/* Attachments Button */}
        <button
          type="button"
          className="rounded-full bg-gray-100 p-3 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          disabled={!username}
        >
          <PaperclipIcon size={20} />
        </button>

        {/* Input Container */}
        <div className="flex flex-grow items-center rounded-full border border-blue-300 bg-white px-4 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800">
          <ImageIcon
            size={20}
            className={`mr-2 ${
              username ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            } text-gray-500 dark:text-gray-400`}
          />

          <input
            className="flex-grow rounded-full bg-transparent p-2 text-gray-700 outline-none dark:text-gray-100"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              username ? "Type a message..." : "Please log in to chat"
            }
            disabled={isLoading || !username}
          />

          <SmileIcon
            size={20}
            className={`ml-2 ${
              username ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            } text-gray-500 dark:text-gray-400`}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading || !username}
          className={`rounded-full p-3 text-white shadow-md transition-all ${
            input.trim() && !isLoading && username
              ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              : "cursor-not-allowed bg-blue-300 opacity-70 dark:bg-blue-700"
          }`}
        >
          <SendIcon size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
