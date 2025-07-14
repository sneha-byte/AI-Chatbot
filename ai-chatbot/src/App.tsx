import "./index.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  Search,
  MessageSquarePlus,
  BookOpen,
  ChevronDown,
  Plus,
  Wrench,
  Mic,
  Maximize2,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";

/*component state data some hardcoded chats */
const initialChats = [
  "Missing dev script fix",
  "Number Base Conversions",
  "GCD and Linear Combination",
  "Inductive Proof Verification",
  "Android R Class Usage",
  "Inverse Function Explanation",
  "Fetch My Posts",
  "Adding try-catch blocks",
  "Login Activity Firebase Setup",
  "Push Repo to GitHub",
  "Increase gap between elements",
  "DTFT DFT Evaluation",
  "LTI system frequency response",
  "DTFT Impulse Response Calcula...",
  "JSP ClassNotFoundException Fix",
];

// Funtion to create a button with icon/react node and label to have a icon and text next to each other
function SideBarButton(icon: React.ReactNode, label: string) {
  return (
    <button className="w-full flex items-center gap-3 text-white hover:bg-[#2a2a2a] h-11 px-3 rounded-lg">
      {icon}
      {label}
    </button>
  );
}

// Function to place a react icon that takes in a react node
function ChatPromptButton(icon: React.ReactNode) {
  return (
    <button className="text-gray-400 hover:text-white hover:bg-[#404040] h-8 w-8 rounded-lg flex items-center justify-center transition-colors">
      {icon}
    </button>
  );
}
type Message = { role: "user" | "assistant"; content: string };
type History = Record<string, Message[]>;
type Nugget = {
  title: string;
  id: keyof History;
};

function App() {
  // manage input state and chat history state
  const [input, setInput] = useState("");

  const [currentChatId, setCurrentChatId] = useState<keyof History>("");

  // chat history state to store messages with role and content
  // role can be either user or assistant and content is the message text
  const [chatHistory, setChatHistory] = useState<History>({
    [uuidv4()]: [],
  });

  // set new chat state to true and clear chat history
  const handleNewChat = () => {
    const newChatID = uuidv4(); // Generate a unique ID for the new chat
    setChatHistory((prev) => ({
      ...prev,
      [newChatID]: [], // Create a new chat with a unique ID
    }));
    setCurrentChatId(newChatID); // Set the current chat ID to the new chat
    setInput(""); // Clear the input field
  };

  useEffect(() => {
    if (!currentChatId) {
      setCurrentChatId(Object.keys(chatHistory)[0] ?? "");
    }
  }, []);

  // Function to handle sending messages
  // It checks if input is not empty, adds user message to chat history,
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat history prev is previous state
    // creates a new array with the previous messages and the new user message
    if (!currentChatId || !(currentChatId in chatHistory)) {
      return;
    }
    setChatHistory((prev) => ({
      ...prev,
      [currentChatId]: [
        ...prev[currentChatId],
        { role: "user", content: input },
      ],
    }));

    // Clear the input field after sending the message
    setInput("");

    try {
      // Send the user message to the backend API res is the http response from the API
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      // res.json gets actual data from the response which is the assistant's reply
      const data = await res.json();

      // Add assistant response to chat history
      if (!currentChatId || !(currentChatId in chatHistory)) {
        return;
      }
      setChatHistory((prev) => ({
        ...prev,
        [currentChatId]: [
          ...prev[currentChatId],
          { role: "assistant", content: data.response || data.error },
        ],
      }));

      // If the response is empty or an error, it will show "Something went wrong."
    } catch (err) {
      setChatHistory((prev) => ({
        ...prev,
        [currentChatId]: [
          ...prev[currentChatId],
          { role: "assistant", content: "Something went wrong." },
        ],
      }));
      console.error(err);
    }
  };

  const handleChatClick = useCallback(
    (chatID: keyof History) => {
      setCurrentChatId(chatID);
    },
    [chatHistory, currentChatId]
  );

  const chatList = useMemo(() => {
    return Object.entries(chatHistory).map((item, _) => ({
      title: item[1][0]?.content ?? "New Chat",
      id: item[0],
    })).reverse();
  }, [chatHistory]);

  return (
    /* full height flex container*/
    <div className="flex h-screen bg-[#212121] text-white">
      {/* Left Sidebar  */}
      <div className="w-70 bg-black hidden md:flex flex-col">
        {/* Top Section of side bar with new chat and search chat and library button */}
        <div className="p-4 space-y-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 text-white hover:bg-[#2a2a2a] h-11 px-3 rounded-lg"
          >
            <MessageSquarePlus className="w-4 h-4" />
            New chat
          </button>
          {SideBarButton(<Search className="w-4 h-4" />, "Search chats")}
          {SideBarButton(<BookOpen className="w-4 h-4" />, "Library")}
        </div>

        {/* Divider using top border and gap of 4px all around */}
        <div className="border-t border-[#2a2a2a] mx-4"></div>

        {/* Middle Section with gpt and sora all around margin 3 and gap between buttons 2*/}
        <div className="p-3 space-y-2">
          <button className="w-full flex items-center gap-3 text-white hover:bg-[#2a2a2a] h-11 px-3 rounded-lg">
            <Sparkles className="w-4 h-4" />
            Sora
          </button>
          <button className="w-full flex items-center gap-3 text-white hover:bg-[#2a2a2a] h-11 px-3 rounded-lg">
            <Zap className="w-4 h-4" />
            GPTs
          </button>
        </div>

        {/* Chats Section with heading and the hardcoded chat history const*/}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2">
            <h3 className="text-s font-medium text-gray-400 mb-2">Chats</h3>
            <div className="space-y-1">
              {/* Map through the chats array and create a button for each chat */}

              {chatList.map((chat, index) => (
                <button
                  key={index}
                  className="w-full flex items-center text-left text-white hover:bg-[#2a2a2a] py-2 px-3 text-sm font-normal rounded-lg"
                  onClick={() => handleChatClick(chat.id)}
                >
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
              {initialChats.map((chat, index) => (
                <button
                  key={index}
                  className="w-full flex items-center text-left text-white hover:bg-[#2a2a2a] py-2 px-3 text-sm font-normal rounded-lg"
                >
                  <span className="truncate">{chat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section with upgrade plan*/}
        <div className="p-3 border-t border-[#2a2a2a]">
          <button className="w-full flex items-center justify-start gap-3 text-white hover:bg-[#2a2a2a] h-11 px-3 rounded-lg transition-colors">
            <Crown className="w-4 h-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm">Upgrade plan</span>
              <span className="text-xs text-gray-400">
                More access to the best models
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content lighter gray area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="flex items-center gap-2 text-white hover:bg-[#2a2a2a] px-3 py-2 rounded-lg transition-colors">
                ChatGPT
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-[#6366f1] hover:bg-[#5855eb] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Get Plus
            </button>
            <button className="text-white hover:bg-[#2a2a2a] p-2 rounded-lg transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black text-sm font-medium">
              S
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-3xl relative">
            {/* Chat view */}
            <div className="flex flex-col gap-4 mb-4">
              {currentChatId in chatHistory &&
                chatHistory[currentChatId].map((msg, idx) => (
                  <div
                    key={idx}
                    className={
                      msg.role === "user"
                        ? // If the message is from user then align to right
                          "self-end bg-[#6366f1] text-white px-4 py-2 rounded-xl max-w-[70%]"
                        : // If the message is from assistant then align to left
                          "self-start bg-[#2f2f2f] text-white px-4 py-2 rounded-xl max-w-[70%]"
                    }
                  >
                    {msg.content}
                  </div>
                ))}
            </div>
            {/* Input and icons */}
            <div className="relative w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Ask anything"
                className="w-full bg-[#2f2f2f] border border-white text-white rounded-xl py-4 px-4 pr-40"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {ChatPromptButton(<Plus className="w-4 h-4" />)}
                <span className="text-xs text-gray-400">Tools</span>
                {ChatPromptButton(<Wrench className="w-4 h-4" />)}
                {ChatPromptButton(<Mic className="w-4 h-4" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
