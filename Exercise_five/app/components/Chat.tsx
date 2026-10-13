"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const question = input.trim();

    if (!question || isLoading) return;

    sendMessage({ text: question });
    setInput("");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto flex h-[85vh] max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <header className="border-b border-slate-800 p-5">
          <h1 className="text-2xl font-bold">Database Chat Tool</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ask questions about your movies and users database and jokes.
          </p>
        </header>

        <section className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="mt-12 text-center">
              <h2 className="text-lg font-semibold">How can I help you?</h2>

              <p className="mt-2 text-sm text-slate-400">
                Try: Show me all sci-fi movies
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Try: Find users over 25
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Try: Count total movies by genre
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-100"
                }`}
              >
                <p className="mb-1 text-xs font-semibold opacity-70">
                  {message.role === "user" ? "You" : "AI Assistant"}
                </p>

                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <p
                      key={index}
                      className="whitespace-pre-wrap break-words text-sm leading-6"
                    >
                      {part.text}
                    </p>
                  ) : null,
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <p className="text-sm text-slate-400">AI is thinking...</p>
          )}

          {error && (
            <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
              Something went wrong. Please try again.
            </p>
          )}
        </section>

        <form
          onSubmit={handleSubmit}
          className="flex gap-3 border-t border-slate-800 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about movies or users..."
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
