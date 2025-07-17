"use client"

import "./index.css"
import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import remarkGfm from "remark-gfm"

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
  Send,
  Bot,
} from "lucide-react"

// Function to create a button with icon/react node and label to have a icon and text next to each other
function SideBarButton(icon: React.ReactNode, label: string) {
  return (
    <button className="w-full flex items-center gap-3 text-white hover:bg-[#2a2a2a] h-11 px-3 rounded-lg transition-colors">
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  )
}

// Function to place a react icon that takes in a react node
function ChatPromptButton(icon: React.ReactNode) {
  return (
    <button className="text-gray-400 hover:text-white hover:bg-[#404040] h-8 w-8 rounded-lg flex items-center justify-center transition-colors">
      {icon}
    </button>
  )
}

type Message = { role: "user" | "assistant"; content: string }

// History type to store chat history. record is an object with chat ID as key and an array of messages as value
type History = Record<string, Message[]>

function App() {
  // manage input state and chat history state
  const [input, setInput] = useState("")
  // stores currently selected chat ID and uses keyof History to matches it to one of the keys in the chat history
  const [currentChatId, setCurrentChatId] = useState<keyof History>("")
  // entire memory of chats with a unique ID for each chat and an array of messages in that chat
  const [chatHistory, setChatHistory] = useState<History>({
    [uuidv4()]: [],
  })

  // Random greeting messages
  const greetingMessages = [
    "How can I help you today?",
    "Ask me a question",
    "What can I do for you?",
    "How may I assist you?",
    "What would you like to know?",
    "Ready to help with anything",
    "What's on your mind?",
    "How can I be of service?",
    "What can I help you with?",
    "Ask me anything",
    "What would you like to explore?",
    "How can I make your day better?",
  ]

  // Select a random greeting message that stays consistent during the session
  const randomGreeting = useMemo(() => {
    return greetingMessages[Math.floor(Math.random() * greetingMessages.length)]
  }, [])

  // function to create new chat, set id for new chat and clear input field. Add new empty chat to chat history
  const handleNewChat = () => {
    const newChatID = uuidv4()
    setChatHistory((prev) => ({
      ...prev,
      [newChatID]: [],
    }))
    setCurrentChatId(newChatID)
    setInput("")
  }

  // if no current chat ID is selected, it sets the first chat ID from chat history as the current chat ID
  useEffect(() => {
    if (!currentChatId) {
      setCurrentChatId(Object.keys(chatHistory)[0] ?? "")
    }
  }, [])

  // Function to handle sending messages
  const handleSendMessage = async () => {
    if (!input.trim()) return

    // update chat history by appending the user message onto the chat with currentChatId
    if (!currentChatId || !(currentChatId in chatHistory)) {
      return
    }

    setChatHistory((prev) => ({
      ...prev,
      [currentChatId]: [...prev[currentChatId], { role: "user", content: input }],
    }))

    // Clear the input field after sending the message
    setInput("")

    try {
      // Create new chat by appending the user message to existing chat with currentChatId to make sure the state is updated when its given to the backend
      const newChat = [...chatHistory[currentChatId], { role: "user", content: input }]

      // Send the chat to the backend API
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: newChat }),
      })

      // res.json gets actual data from the response which is the assistant's reply
      const data = await res.json()

      // Update chat history of chat with current chat id with the assistant's response or error message
      if (!currentChatId || !(currentChatId in chatHistory)) {
        return
      }

      setChatHistory((prev) => ({
        ...prev,
        [currentChatId]: [...prev[currentChatId], { role: "assistant", content: data.response || data.error }],
      }))
    } catch (err) {
      setChatHistory((prev) => ({
        ...prev,
        [currentChatId]: [...prev[currentChatId], { role: "assistant", content: "Something went wrong." }],
      }))
      console.error(err)
    }
  }

  // usecallback to avoid recreating the function on every render
  const handleChatClick = useCallback(
    (chatID: keyof History) => {
      setCurrentChatId(chatID)
    },
    [chatHistory, currentChatId],
  )

  // in chatList each chat object has a title which is the content of the 1st message and the key of the chat in chatHistory
  // useMemo to avoid unnecessary re renders and only recalculate chatList when chatHistory changes
  const chatList = useMemo(() => {
    return Object.entries(chatHistory)
      .map((item, _) => ({
        title: item[1][0]?.content ?? "New Chat",
        id: item[0],
      }))
      .reverse()
  }, [chatHistory])

  // NEW (add this just below chatList):
  const currentMessages = chatHistory[currentChatId] ?? []

  return (
    /* full height flex container with dark background */
    <div className="flex h-screen bg-[#212121] text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#181818] hidden md:flex flex-col border-r border-[#2a2a2a]">
        {/* Top Section of side bar with new chat and search chat and library button */}
        <div className="p-3 space-y-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 text-white hover:bg-[#2a2a2a] h-11 px-3 rounded-lg transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span className="text-sm">New chat</span>
          </button>
          {SideBarButton(<Search className="w-4 h-4" />, "Search chats")}
          {SideBarButton(<BookOpen className="w-4 h-4" />, "Library")}
        </div>

        {/* Divider */}
        <div className="border-t border-[#2a2a2a] mx-3"></div>

        {/* Middle Section */}
        <div className="p-3 space-y-2">
          <button className="w-full flex items-center gap-3 text-white hover:bg-[#2a2a2a] h-11 px-3 rounded-lg transition-colors">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Sora</span>
          </button>
          <button className="w-full flex items-center gap-3 text-white hover:bg-[#2a2a2a] h-11 px-3 rounded-lg transition-colors">
            <Zap className="w-4 h-4" />
            <span className="text-sm">GPTs</span>
          </button>
        </div>

        {/* Chats Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2">
            <h3 className="text-xs font-medium text-gray-400 mb-2 px-3">Recent</h3>
            <div className="space-y-1">
              {chatList.map((chat, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center text-left hover:bg-[#2a2a2a] py-2.5 px-3 text-sm rounded-lg transition-colors ${
                    chat.id === currentChatId ? "bg-[#2a2a2a]" : "text-gray-300"
                  }`}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[#2a2a2a]">
          <button className="w-full flex items-center justify-start gap-3 text-white hover:bg-[#2a2a2a] h-12 px-3 rounded-lg transition-colors">
            <Crown className="w-4 h-4 text-yellow-500" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Upgrade plan</span>
              <span className="text-xs text-gray-400">More access to the best models</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#212121] min-h-0">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] bg-[#212121]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="flex items-center gap-2 text-white hover:bg-[#2a2a2a] px-3 py-2 rounded-lg transition-colors">
                <span className="font-medium">ChatGPT</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-[#6366f1] hover:bg-[#5855eb] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />
              Get Plus
            </button>
            <button className="text-white hover:bg-[#2a2a2a] p-2 rounded-lg transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              S
            </div>
          </div>
        </div>

        {/* Main Chat Area - Fixed background issue */}
        <div className="flex-1 flex flex-col bg-[#212121] min-h-0">
          {currentMessages.length === 0 ? (
            // Centered input when no messages
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#212121]">
              <div className="text-center text-4xl font-semibold text-white mb-8">{randomGreeting}</div>
              <div className="w-full max-w-3xl">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage()
                    }}
                    placeholder="Message ChatGPT"
                    className="w-full bg-[#2f2f2f] border border-[#4a4a4a] text-white rounded-3xl py-4 px-6 pr-16 focus:outline-none focus:border-[#6366f1] transition-colors placeholder-gray-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {input.trim() ? (
                      <button
                        onClick={handleSendMessage}
                        className="bg-white text-black hover:bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        {ChatPromptButton(<Wrench className="w-4 h-4" />)}
                        {ChatPromptButton(<Mic className="w-4 h-4" />)}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Messages layout - Fixed scrolling background issue
            <>
              {/* Messages Container with proper background */}
              <div className="flex-1 overflow-y-auto bg-[#212121]" style={{ minHeight: 0 }}>
                <div className="max-w-4xl mx-auto px-6 py-6 space-y-6 bg-[#212121]">
                  {currentMessages.map((msg, idx) => (
                    <div key={idx} className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {msg.role === "user" ? (
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            S
                          </div>
                        ) : (
                          // Replace the complex SVG section with:
                          <div className="w-8 h-8 bg-[#10a37f] rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white prose prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                              code: ({ node, children, ...props }) =>
                                (node && (node as any).inline) ? (
                                  <code className="bg-[#2f2f2f] px-1.5 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="bg-[#2f2f2f] p-4 rounded-lg overflow-x-auto">
                                    <code {...props}>{children}</code>
                                  </pre>
                                ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input bar at the bottom - Fixed positioning */}
              <div className="border-t border-[#2a2a2a] bg-[#212121] p-4">
                <div className="max-w-4xl mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage()
                      }}
                      placeholder="Message ChatGPT"
                      className="w-full bg-[#2f2f2f] border border-[#4a4a4a] text-white rounded-3xl py-4 px-6 pr-16 focus:outline-none focus:border-[#6366f1] transition-colors placeholder-gray-400"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {input.trim() ? (
                        <button
                          onClick={handleSendMessage}
                          className="bg-white text-black hover:bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          {ChatPromptButton(<Wrench className="w-4 h-4" />)}
                          {ChatPromptButton(<Mic className="w-4 h-4" />)}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
