import { useState } from "react";
import { PaperclipIcon, SendIcon, ImageIcon, SmileIcon } from "lucide-react";
import MoodTracker from "./mood-tracker";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMoodTracker, setShowMoodTracker] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: input.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setMessages([...messages, newMessage]);
      setInput("");

      // Hide mood tracker once user starts chatting
      setShowMoodTracker(false);

      // automated response ->
      setTimeout(() => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for your message! This is a placeholder response.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, responseMessage]);
      }, 1000);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
        {showMoodTracker && <MoodTracker />}

        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                  message.isUser
                    ? "rounded-tr-none bg-blue-500 text-white"
                    : "rounded-tl-none bg-white text-gray-800 dark:bg-gray-600 dark:text-gray-100"
                }`}
              >
                <p>{message.text}</p>
                <p
                  className={`mt-1 text-xs ${
                    message.isUser
                      ? "text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {messages.length === 0 && !showMoodTracker && (
            <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
              <p>Start a conversation...</p>
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
        >
          <PaperclipIcon size={20} />
        </button>

        {/* Input Container */}
        <div className="flex flex-grow items-center rounded-full border border-blue-300 bg-white px-4 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-800">
          <ImageIcon
            size={20}
            className="mr-2 cursor-pointer text-gray-500 dark:text-gray-400"
          />

          <input
            className="flex-grow rounded-full bg-transparent p-2 text-gray-700 outline-none dark:text-gray-100"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />

          <SmileIcon
            size={20}
            className="ml-2 cursor-pointer text-gray-500 dark:text-gray-400"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim()}
          className={`rounded-full p-3 text-white shadow-md transition-all ${
            input.trim()
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
