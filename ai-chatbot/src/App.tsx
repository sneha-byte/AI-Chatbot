import "./index.css";
import React, { useState } from "react";

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
const chatHistory = [
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

function App() {
  // State to hold input and response
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setResponse(data.response || data.error);
    } catch (err) {
      setResponse("Something went wrong.");
      console.error(err);
    }
  };

  return (
    /* full height flex container*/
    <div className="flex h-screen bg-[#212121] text-white">
      {/* Left Sidebar  */}
      <div className="w-70 bg-black hidden md:flex flex-col">
        {/* Top Section of side bar with new chat and search chat and library button */}
        <div className="p-4 space-y-2">
          {SideBarButton(<MessageSquarePlus className="w-4 h-4" />, "New chat")}
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
              {chatHistory.map((chat, index) => (
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
          <h1 className="text-2xl font-medium text-white mb-8">
            What are you working on?
          </h1>

          <div className="w-full max-w-3xl relative">
            <div className="relative">
              {/* Text box when changed set state to current input which is e.target.value  */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                /* When enter is pressed call handleSendMessage function */
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                placeholder="Ask anything"
                className="w-full bg-[#2f2f2f] border border-white text-white rounded-xl py-4 px-4"
              />

              {/* Check if response exists and then  */}
              {response && (
                <div className="mt-4 text-white">
                  <strong>GPT:</strong> {response}
                </div>
              )}

              <div className="absolute right-3 top-1/2  -translate-y-1/2 flex items-center gap-2">
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
