import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { and, eq, asc, inArray } from "drizzle-orm";
import type { UIMessage } from "ai";

// Load messages
export async function loadChat(
  conversationId: string,
  userId: string,
): Promise<UIMessage[]> {
  try {
    const messages = await db
      .select()
      .from(message)
      .where(
        and(
          eq(message.conversationId, conversationId),
          eq(message.userId, userId),
        ),
      )
      .orderBy(message.createdAt);

    return messages.map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      parts: [{ type: "text", text: msg.content }],
    }));
  } catch (error) {
    console.error("LOAD CHAT ERROR:", error);
    throw error;
  }
}

// Save messages

export async function saveChat(
  chatId: string,
  messages: UIMessage[],
  userId: string,
) {
  try {
    const [conv] = await db
      .select({ userId: conversation.userId })
      .from(conversation)
      .where(and(eq(conversation.id, chatId), eq(conversation.userId, userId)))
      .limit(1);

    if (!conv) {
      throw new Error("Conversation not found or unauthorized");
    }

    const existingMessages = await db
      .select({ id: message.id })
      .from(message)
      .where(eq(message.conversationId, chatId));

    const existingIds = new Set(existingMessages.map((msg) => msg.id));

    const messageData = messages
      .filter((msg) => !existingIds.has(msg.id))
      .map((msg) => ({
        id: msg.id,
        conversationId: chatId,
        userId,
        role: msg.role,
        content: msg.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(""),
      }))
      .filter((msg) => msg.content.trim().length > 0);

    if (messageData.length > 0) {
      await db.insert(message).values(messageData);
    }

    // Update title using the first user message
    const firstUserMessage = messages.find((msg) => msg.role === "user");

    if (firstUserMessage) {
      const title = firstUserMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("")
        .trim()
        .slice(0, 40);

      if (title) {
        await db
          .update(conversation)
          .set({
            title,
            updatedAt: new Date(),
          })
          .where(
            and(eq(conversation.id, chatId), eq(conversation.userId, userId)),
          );
      }
    }

    if (firstUserMessage) {
      const title = firstUserMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("")
        .trim()
        .slice(0, 40);

      await db
        .update(conversation)
        .set({
          title: title || "New chat",
          updatedAt: new Date(),
        })
        .where(
          and(eq(conversation.id, chatId), eq(conversation.userId, userId)),
        );
    }

    console.log("Chat saved successfully");
  } catch (error) {
    console.error("SAVE CHAT ERROR:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Database cause:", error.cause);
    }

    throw error;
  }
}

// Delete messages and conversation
export async function deleteChat(
  conversationId: string,
  userId: string,
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(message)
        .where(
          and(
            eq(message.conversationId, conversationId),
            eq(message.userId, userId),
          ),
        );

      await tx
        .delete(conversation)
        .where(
          and(
            eq(conversation.id, conversationId),
            eq(conversation.userId, userId),
          ),
        );
    });
  } catch (error) {
    console.error("LOAD CHAT ERROR:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Database cause:", error.cause);
    }

    throw error;
  }
}

// Delete the selected message and every message after it

export async function deleteMessagesFrom(
  conversationId: string,
  messageId: string,
  userId: string,
): Promise<boolean> {
  try {
    // Get all messages in this conversation
    const conversationMessages = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(
          eq(message.conversationId, conversationId),
          eq(message.userId, userId),
        ),
      )
      .orderBy(asc(message.createdAt));

    // Find the selected message
    const selectedIndex = conversationMessages.findIndex(
      (msg) => msg.id === messageId,
    );

    if (selectedIndex === -1) {
      return false;
    }

    // Get selected message and all following messages
    const idsToDelete = conversationMessages
      .slice(selectedIndex)
      .map((msg) => msg.id);

    // Delete messages
    await db
      .delete(message)
      .where(
        and(
          inArray(message.id, idsToDelete),
          eq(message.conversationId, conversationId),
          eq(message.userId, userId),
        ),
      );

    return true;
  } catch (error) {
    console.error("DELETE MESSAGES ERROR:", error);
    throw error;
  }
}
