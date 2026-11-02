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

import { Paperclip, Send, Square, X, Pencil } from "lucide-react";

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
      <div className="flex h-full items-center justify-center">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <h1 className="text-3xl font-bold">What can I help you with?</h1>

              <p className="mt-3 text-sm text-muted-foreground">
                Ask anything and start a conversation.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "w-full"
                }`}
              >
                {/* Message content */}
                {message.parts.map((part, index) => {
                  // Text
                  if (part.type === "text") {
                    return message.role === "assistant" ? (
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
                          className="mb-3 max-h-72 rounded-lg object-contain"
                        />
                      );
                    }
                  }

                  return null;
                })}

                {/* Edit button */}
                {message.role === "user" && (
                  <button
                    type="button"
                    onClick={() => handleEditMessage(message)}
                    className="mt-2 flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {status === "submitted" && (
            <p className="text-sm text-muted-foreground">AI is thinking...</p>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive p-4 text-sm">
              <p>{error.message}</p>

              <button
                type="button"
                onClick={() => regenerate()}
                className="mt-2 underline"
              >
                Try again
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="shrink-0 border-t p-4">
        <div className="mx-auto max-w-3xl">
          {/* Editing indicator */}
          {editingMessageId && (
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Editing message</span>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-muted-foreground hover:text-foreground"
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
                    className="h-20 w-20 rounded-lg object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 rounded-2xl border bg-background p-3 shadow-sm"
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
              className="rounded-lg p-2 hover:bg-muted"
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
              className="max-h-40 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm outline-none"
            />

            {/* Send / Stop */}
            {status === "streaming" || status === "submitted" ? (
              <button
                type="button"
                onClick={() => stop()}
                className="rounded-lg bg-destructive p-3 text-white"
                title="Stop generating"
              >
                <Square size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={
                  (!input.trim() && attachments.length === 0) ||
                  status !== "ready"
                }
                className="rounded-lg bg-primary p-3 text-primary-foreground disabled:opacity-50"
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
