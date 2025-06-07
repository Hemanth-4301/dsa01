import type React from "react";
import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import {
  Copy,
  Send,
  Bot,
  Loader2,
  Volume2,
  VolumeX,
  Mic,
  Plus,
} from "lucide-react";

// Configure marked to use highlight.js for code blocks
marked.setOptions({
  highlight: (code, lang) => {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: "hljs language-",
});

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMessageId, setSpeechMessageId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechSynthesis = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const apikey = import.meta.env.VITE_GEMINI_API_KEY;

  const startNewConversation = () => {
    setMessages([]);
    setInput("");
  };

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setError("Speech recognition failed. Please try again.");
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          setIsListening(false);
        }
      };
    } else {
      console.warn("Speech recognition not supported");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, [speechSynthesis]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition start failed:", e);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    // Include previous messages for context
    const conversationHistory = [...messages, userMessage]
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apikey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apikey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a helpful AI assistant. Continue this conversation and remember the context:\n\n${conversationHistory}\n\nAssistant:`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const botResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setError("Failed to get response from AI. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I encountered an error processing your request. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    const toast = document.createElement("div");
    toast.textContent = "Copied to clipboard!";
    toast.className =
      "fixed bottom-4 right-4 bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white px-4 py-2 rounded-xl shadow-lg z-50 backdrop-blur-sm border border-white/20";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const toggleSpeech = (message: Message) => {
    if (isSpeaking && speechMessageId === message.id) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeechMessageId(null);
      return;
    }

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(
      message.content.replace(/```[\s\S]*?```/g, "")
    );
    utteranceRef.current = utterance;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeechMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechMessageId(null);
    };

    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setSpeechMessageId(message.id);
  };

  const stopAllSpeech = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeechMessageId(null);
  };

  // Stop speech when component unmounts or page is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAllSpeech();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const extractCodeBlocks = (content: string) => {
    // Regex to match code blocks: ```language\ncontent\n``` or ```content```
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)\s*```/g;
    const blocks: { type: string; language?: string; content: string }[] = [];
    let lastIndex = 0;

    // Replace \r\n or \r with \n for consistent newline handling
    let normalizedContent = content.replace(/\r\n|\r/g, "\n");

    // Handle unclosed code blocks by appending closing backticks
    if (normalizedContent.includes("```")) {
      const lastOpen = normalizedContent.lastIndexOf("```");
      if (
        lastOpen !== -1 &&
        !normalizedContent.slice(lastOpen).includes("```", 3)
      ) {
        normalizedContent += "\n```";
      }
    }

    let match;
    while ((match = codeBlockRegex.exec(normalizedContent)) !== null) {
      // Capture text before the code block
      if (match.index > lastIndex) {
        const text = normalizedContent.substring(lastIndex, match.index).trim();
        if (text) {
          blocks.push({ type: "text", content: text });
        }
      }

      // Capture the code block
      const language = match[1] || "plaintext";
      const codeContent = match[2].trim(); // Trim whitespace from code content
      if (codeContent || codeContent === "") {
        blocks.push({ type: "code", language, content: codeContent });
      }

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Capture any remaining text after the last code block
    if (lastIndex < normalizedContent.length) {
      const text = normalizedContent.substring(lastIndex).trim();
      if (text) {
        blocks.push({ type: "text", content: text });
      }
    }

    // If no blocks were found, treat the entire content as text
    return blocks.length
      ? blocks
      : [{ type: "text", content: normalizedContent.trim() || "" }];
  };

  const renderMessageContent = (content: string) => {
    const blocks = extractCodeBlocks(content);

    return (
      <div className="prose prose-slate dark:prose-invert max-w-full prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-pre:bg-transparent prose-pre:p-0 prose-li:text-gray-800 dark:prose-li:text-gray-200">
        {blocks.map((block, index) => {
          if (block.type === "code") {
            const highlightedCode = hljs.highlight(block.content, {
              language: block.language || "plaintext",
            }).value;

            return (
              <div key={index} className="relative my-3 sm:my-4">
                <div className="flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900 text-slate-300 px-3 sm:px-4 py-2 text-sm rounded-t-xl border border-slate-700/50">
                  <span className="font-medium">
                    {block.language || "code"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(block.content)}
                    className="flex items-center gap-2 hover:text-white transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </div>
                <pre className="m-0 p-3 sm:p-4 bg-black rounded-b-xl overflow-x-auto border-x border-b border-slate-700/50">
                  <code
                    className={`hljs language-${block.language || "plaintext"}`}
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                  />
                </pre>
              </div>
            );
          }

          // Process markdown and bold important text (between **)
          const html = marked(
            block.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          );
          return (
            <div
              key={index}
              dangerouslySetInnerHTML={{ __html: html }}
              className="my-1 sm:my-2 break-words"
            />
          );
        })}
      </div>
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-violet-400/20 via-purple-300/20 to-indigo-400/20 dark:from-violet-600/30 dark:via-purple-500/30 dark:to-indigo-600/30 backdrop-blur-3xl rounded-2xl overflow-hidden border border-white/30 dark:border-white/20 shadow-2xl relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-400/10 to-cyan-400/10 dark:from-pink-500/20 dark:via-purple-500/20 dark:to-cyan-500/20 "></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 dark:via-white/10 to-transparent"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-white/25 via-white/20 to-white/25 dark:from-gray-900/40 dark:via-gray-800/40 dark:to-gray-900/40 backdrop-blur-xl border-b border-white/30 dark:border-white/20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 backdrop-blur-sm border border-white/30 shadow-lg">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-violet-700 dark:text-violet-300 animate-bounce-slow" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 dark:from-violet-300 dark:to-purple-300 bg-clip-text text-transparent">
              AI Assistant
            </h2>
          </div>
        </div>
        <button
          onClick={startNewConversation}
          className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 bg-gradient-to-r from-violet-500/80 to-purple-600/80 text-white text-sm hover:from-violet-600/90 hover:to-purple-700/90 transition-all duration-300 backdrop-blur-sm shadow-lg border border-white/20 hover:scale-105"
          title="New Conversation"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Chat area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-1 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-700 dark:text-gray-200 p-4 sm:p-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 flex items-center justify-center bg-gradient-to-br from-violet-400/30 to-purple-500/30 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-sm border border-white/30">
              <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-violet-700 dark:text-violet-300 animate-bounce-slow" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 dark:from-violet-300 dark:to-purple-300 bg-clip-text text-transparent mb-2 sm:mb-3 text-center">
              How can I help you today?
            </h3>
            <p className="text-center max-w-md text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2">
              Ask me anything about coding, algorithms, or tech. I can explain
              concepts, help debug code, or suggest solutions.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:gap-3 w-full max-w-lg px-2">
              {[
                "What's the optimal solution for the 3Sum problem in Java?",
                "How to optimize SQL queries?",
              ].map((prompt, i) => (
                <div
                  key={i}
                  className="p-3 sm:p-4 rounded-xl cursor-pointer bg-gradient-to-r from-white/40 to-white/30 dark:from-gray-800/50 dark:to-gray-700/50 hover:from-white/50 hover:to-white/40 dark:hover:from-gray-700/60 dark:hover:to-gray-600/60 transition-all duration-300 backdrop-blur-sm border border-white/30 dark:border-white/20 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  onClick={() => setInput(prompt)}
                >
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-relaxed">
                    {prompt.split("?")[0].substring(0, 40)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`w-full rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm border shadow-lg ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-violet-500/20 to-purple-600/20 dark:from-violet-600/30 dark:to-purple-700/30 border-violet-300/30 dark:border-violet-400/30 text-gray-800 dark:text-gray-100"
                      : "dark:bg-black border-white/40 dark:border-white/20 text-gray-800 dark:text-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {message.role === "user" ? "You" : "AI Assistant"}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => toggleSpeech(message)}
                          className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                            isSpeaking && speechMessageId === message.id
                              ? "text-red-500 bg-red-100/50 dark:bg-red-900/30"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/30 dark:hover:bg-white/10"
                          }`}
                          title={
                            isSpeaking && speechMessageId === message.id
                              ? "Stop reading"
                              : "Read aloud"
                          }
                        >
                          {isSpeaking && speechMessageId === message.id ? (
                            <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))}
          </>
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-full rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-white/40 to-white/30 dark:from-gray-800/60 dark:to-gray-700/60 backdrop-blur-sm border border-white/40 dark:border-white/20 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-400/30 to-purple-500/30">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-700 dark:text-violet-300" />
                </div>
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-violet-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm p-3 sm:p-4 text-center rounded-xl bg-gradient-to-r from-red-100/60 to-pink-100/60 dark:from-red-900/40 dark:to-pink-900/40 backdrop-blur-sm border border-red-200/50 dark:border-red-700/50 shadow-lg">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 p-3 sm:p-4 bg-gradient-to-r from-white/25 via-white/20 to-white/25 dark:from-gray-900/40 dark:via-gray-800/40 dark:to-gray-900/40 backdrop-blur-xl border-t border-white/30 dark:border-white/20"
      >
        <div className="flex flex-col sm:flex-row items-end gap-2 sm:gap-3">
          {/* Text input */}
          <div className="flex-1 w-full">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="w-full resize-none rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-white/60 to-white/50 dark:from-gray-700/60 dark:to-gray-600/60 text-gray-800 dark:text-black placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-400/50 border border-white/50 dark:border-white/30 backdrop-blur-sm shadow-lg transition-all duration-300 focus:shadow-xl"
              rows={1}
              autoFocus={false}
              style={{ minHeight: "48px", maxHeight: "120px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg ${
                isListening
                  ? "text-white bg-gradient-to-r from-red-500 to-red-600 shadow-red-200"
                  : "text-gray-600 dark:text-gray-300 bg-gradient-to-r from-white/60 to-white/50 dark:from-gray-700/60 dark:to-gray-600/60 hover:from-white/70 hover:to-white/60 dark:hover:from-gray-600/70 dark:hover:to-gray-500/70 backdrop-blur-sm border border-white/50 dark:border-white/30"
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 sm:mt-5 px-1 sm:px-2 gap-2 sm:gap-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press{" "}
            <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white/30 dark:bg-gray-700/50 rounded text-xs">
              Enter
            </kbd>{" "}
            to send,{" "}
            <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white/30 dark:bg-gray-700/50 rounded text-xs">
              Shift+Enter
            </kbd>{" "}
            for new line
          </p>
          {isSpeaking && (
            <button
              onClick={stopAllSpeech}
              className="text-xs flex items-center gap-1 sm:gap-2 text-red-500 hover:text-red-600 px-2 sm:px-3 py-1 rounded-full bg-white/30 dark:bg-gray-700/30 hover:bg-white/40 dark:hover:bg-gray-600/40 transition-all duration-200"
            >
              <VolumeX className="w-3 h-3" />
              Stop reading
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
