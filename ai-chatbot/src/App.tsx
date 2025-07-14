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

// History type to store chat history. record is an object with chat ID as key and an array of messages as values
type History = Record<string, Message[]>;

function App() {
  // manage input state and chat history state
  const [input, setInput] = useState("");

  // stores currently selected chat ID and uses keyof History to matches it to one of the keys in the chat history
  const [currentChatId, setCurrentChatId] = useState<keyof History>("");

  // chat history state initialized with a unique ID and an empty array
  const [chatHistory, setChatHistory] = useState<History>({
    [uuidv4()]: [],
  });

  // function to create new chat, set id for new chat and clear input field. Add new empty chat to chat history
  const handleNewChat = () => {
    const newChatID = uuidv4();
    setChatHistory((prev) => ({
      ...prev,
      [newChatID]: [],
    }));
    setCurrentChatId(newChatID);
    setInput("");
  };

  // if no current chat ID is selected, it sets the first chat ID from chat history as the current chat ID
  useEffect(() => {
    if (!currentChatId) {
      setCurrentChatId(Object.keys(chatHistory)[0] ?? "");
    }
  }, []);

  // Function to handle sending messages
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // update chat history by appending the user message onto the chat with currentChatId
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
      // Create new chat by appending the user message to existing chat with currentChatId to make sure the state is updated when its given to the backend
      const newChat = [
        ...chatHistory[currentChatId],
        { role: "user", content: input },
      ];

      // Send the chat to the backend API
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: newChat }),
      });

      console.log("Sending to backend:", chatHistory[currentChatId]);

      // res.json gets actual data from the response which is the assistant's reply
      const data = await res.json();

      // Update chat history of chat with current chat id with the assistant's response or error message
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

  // usecallback to avoid recreating the function on every render
  const handleChatClick = useCallback(
    (chatID: keyof History) => {
      setCurrentChatId(chatID);
    },
    [chatHistory, currentChatId]
  );

  // in chatList each chat object has a title which is the content of the 1st message and the key of the chat in chatHistory
  // useMemo to avoid unnecessary re renders and only recalculate chatList when chatHistory changes
  const chatList = useMemo(() => {
    return Object.entries(chatHistory)
      .map((item, _) => ({
        title: item[1][0]?.content ?? "New Chat",
        id: item[0],
      }))
      .reverse();
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
                  // onClick handler to set the current chat ID when clicked
                  onClick={() => handleChatClick(chat.id)}
                >
                  <span className="truncate">{chat.title}</span>
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
        <div
          className={`flex-1 flex flex-col items-center p-7 transition-all duration-500 ${
            // if there are messages apply justify between to push first chiuld to top and last child to bottom else justify center to put all in the middle of screen
            chatHistory[currentChatId]?.length > 0
              ? "justify-between"
              : "justify-center"
          }`}
        >
          <div className="w-full max-w-4xl flex flex-col gap-4">
            {chatHistory[currentChatId]?.length > 0 ? (
              chatHistory[currentChatId].map((msg, idx) => (
                <div
                  key={idx}
                  className={`${
                    msg.role === "user"
                      ? "self-end bg-[#6366f1]"
                      : "self-start bg-[#2f2f2f]"
                  } text-white px-4 py-2 rounded-xl max-w-[90%]`}
                >
                  {msg.content}
                </div>
              ))
            ) : (
              <div className="text-center text-2xl font-bold text-white opacity-70 flex-1 flex items-center justify-center">
                How can I help you today?
              </div>
            )}
          </div>

          {/* Input at the bottom */}
          <div className="w-full max-w-4xl mt-4">
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
