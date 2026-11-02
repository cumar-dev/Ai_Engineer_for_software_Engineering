"use client";

import React, { useEffect, useRef, useState } from "react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { math } from "@streamdown/math";
import { cjk } from "@streamdown/cjk";

import { Paperclip, Send, Square, X, Pencil, Bot, User } from "lucide-react";

const plugins = {
  code,
  mermaid,
  math,
  cjk,
};

interface PropsChat {
  chatId: string;
  initialMessage: UIMessage[];
}

interface Attachment {
  file: File;
  url: string;
}

const Chat = ({ chatId, initialMessage }: PropsChat) => {
  const { isPending, data: session } = useSession();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<Attachment[]>([]);

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
    error,
    regenerate,
  } = useChat({
    id: chatId,
    messages: initialMessage,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        chatId,
      },
    }),
    onFinish: () => {
      router.refresh();
    },
  });

  // Edit existing user message
  const handleEditMessage = (message: UIMessage) => {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");

    setEditingMessageId(message.id);
    setInput(text);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInput("");
  };

  // Authentication
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  // Keep attachment reference updated
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Image upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const newAttachments = imageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);

    event.target.value = "";
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const selected = prev[index];

      if (selected) {
        URL.revokeObjectURL(selected.url);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  // Convert image to data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Unable to read image"));
        }
      };

      reader.onerror = () => reject(reader.error);

      reader.readAsDataURL(file);
    });
  };

  // Send message
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if ((!input.trim() && attachments.length === 0) || status !== "ready") {
      return;
    }

    try {
      const messageText = input.trim();

      const files = await Promise.all(
        attachments.map(async ({ file }) => ({
          type: "file" as const,
          mediaType: file.type,
          url: await fileToDataURL(file),
          filename: file.name,
        })),
      );

      // EDIT EXISTING MESSAGE
      if (editingMessageId) {
        const selectedIndex = messages.findIndex(
          (message) => message.id === editingMessageId,
        );

        if (selectedIndex === -1) {
          throw new Error("Message not found");
        }

        // Delete old message and following messages from database
        const response = await fetch("/api/chat/edit", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversationId: chatId,
            messageId: editingMessageId,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Failed to edit message");
        }

        // Remove old message and old AI response from UI
        const previousMessages = messages.slice(0, selectedIndex);

        setMessages(previousMessages);

        // Send edited message and generate a new response
        await sendMessage({
          text: messageText,
          files,
        });
      } else {
        // SEND NORMAL MESSAGE
        await sendMessage({
          text: messageText,
          files,
        });
      }

      setInput("");
      setAttachments([]);
      setEditingMessageId(null);
    } catch (err) {
      console.error("Failed to send/edit message:", err);
    }
  };

  // Loading authentication
  if (isPending || !session?.user) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        Loading chat...
      </div>
    );
  }

  const userInitial = session.user.name?.trim()?.[0]?.toUpperCase();
  const canSend =
    (input.trim().length > 0 || attachments.length > 0) && status === "ready";
  const isBusy = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                <Bot size={30} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                What can I help you with?
              </h1>

              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Ask anything and start a conversation.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isUser
                      ? "bg-muted text-foreground ring-1 ring-border"
                      : "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  }`}
                >
                  {isUser ? (
                    (userInitial ?? <User size={16} />)
                  ) : (
                    <Bot size={16} />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`group flex min-w-0 flex-col ${
                    isUser ? "max-w-[80%] items-end" : "w-full items-start"
                  }`}
                >
                  <div
                    className={
                      isUser
                        ? "rounded-2xl rounded-tr-md bg-blue-600 px-4 py-2.5 text-white shadow-sm"
                        : "w-full pt-1"
                    }
                  >
                    {message.parts.map((part, index) => {
                      // Text
                      if (part.type === "text") {
                        return !isUser ? (
                          <Streamdown
                            key={index}
                            plugins={plugins}
                            isAnimating={
                              status === "streaming" &&
                              message.id === messages[messages.length - 1]?.id
                            }
                            className="text-sm leading-7"
                          >
                            {part.text}
                          </Streamdown>
                        ) : (
                          <p
                            key={index}
                            className="whitespace-pre-wrap break-words text-sm leading-7"
                          >
                            {part.text}
                          </p>
                        );
                      }

                      // Images
                      if (part.type === "file") {
                        if (part.mediaType?.startsWith("image/")) {
                          return (
                            <img
                              key={index}
                              src={part.url}
                              alt={part.filename ?? "Uploaded image"}
                              className="mb-2 max-h-72 rounded-xl object-contain"
                            />
                          );
                        }
                      }

                      return null;
                    })}
                  </div>

                  {/* Edit button */}
                  {isUser && (
                    <button
                      type="button"
                      onClick={() => handleEditMessage(message)}
                      className="mt-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking indicator */}
          {status === "submitted" && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <Bot size={16} />
              </div>

              <div className="flex items-center gap-1.5 pt-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600/70 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600/70 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600/70" />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
              <p className="text-destructive">{error.message}</p>

              <button
                type="button"
                onClick={() => regenerate()}
                className="mt-2 font-medium text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="shrink-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-4 pt-2">
        <div className="mx-auto max-w-3xl">
          {/* Editing indicator */}
          {editingMessageId && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm dark:bg-blue-500/10">
              <span className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Pencil size={13} />
                Editing message
              </span>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-muted-foreground transition hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Image previews */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {attachments.map((item, index) => (
                <div key={item.url} className="relative">
                  <img
                    src={item.url}
                    alt="Image preview"
                    className="h-20 w-20 rounded-xl border object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    aria-label="Remove image"
                    className="absolute -right-2 -top-2 rounded-full bg-foreground p-1 text-background shadow transition hover:bg-destructive hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 rounded-3xl border bg-background p-2.5 shadow-lg shadow-black/5 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
          >
            {/* File input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Upload image"
            >
              <Paperclip size={20} />
            </button>

            {/* Text input */}
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={
                editingMessageId ? "Edit your message..." : "Ask anything..."
              }
              rows={1}
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm outline-none placeholder:text-muted-foreground [field-sizing:content]"
            />

            {/* Send / Stop */}
            {isBusy ? (
              <button
                type="button"
                onClick={() => stop()}
                className="rounded-full bg-foreground p-3 text-background transition hover:opacity-80"
                title="Stop generating"
              >
                <Square size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend}
                className="rounded-full bg-blue-600 p-3 text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
                title={editingMessageId ? "Update message" : "Send message"}
              >
                <Send size={18} />
              </button>
            )}
          </form>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI can make mistakes. Check important information.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Chat;