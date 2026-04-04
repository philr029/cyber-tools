"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessageBubble from "./ChatMessage";
import type { ChatMessage } from "@/types/chat";
import type { ChatRequest, ChatResponse, ChatErrorResponse } from "@/types/chat";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I'm your cyber admin assistant. Ask me about IPs, domains, Microsoft 365, security checks, or how to use the tools on this site.",
  timestamp: Date.now(),
};

function LoadingDots() {
  return (
    <div className="flex justify-start mb-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center mr-2 mt-0.5">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      // Small delay so the panel animation completes before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build conversation history excluding the welcome message
    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const payload: ChatRequest = { message: text, history };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: ChatResponse | ChatErrorResponse = await res.json();

      const replyContent =
        "reply" in data
          ? data.reply
          : "error" in data
            ? `Sorry, I couldn't get a response right now. Please try again.`
            : "Sorry, I couldn't get a response right now. Please try again.";

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyContent,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't get a response right now. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-700 active:scale-95 transition-all duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        {isOpen ? (
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      <div
        role="dialog"
        aria-label="AI assistant chat"
        aria-modal="false"
        className={`fixed bottom-20 right-5 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden transition-all duration-200 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ maxHeight: "min(560px, calc(100vh - 100px))" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">Cyber Assistant</p>
              <p className="text-[10px] text-gray-400 leading-tight">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={clearChat}
              title="Clear conversation"
              className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close"
              className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0 min-h-0">
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && <LoadingDots />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 pb-3 pt-2 border-t border-gray-100">
          <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-gray-400 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question…"
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-h-[20px] max-h-[120px] leading-5 disabled:opacity-50"
              style={{ overflowY: input.split("\n").length > 4 ? "auto" : "hidden" }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
