import { db } from "@/db/drizzle";
import { conversation, message } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UIMessage } from "ai";
export async function loadChat(conversationId: string): Promise<UIMessage[]> {
  try {
    const messages = await db
      .select()
      .from(message)
      .where(eq(message.conversationId, conversationId))
      .orderBy(message.createdAt);

    return messages.map((message) => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      parts: [{ type: "text", text: message.content }],
    }));
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Something went wrong",
    );
    return [];
  }
}

export async function saveChat(chatId: string, messages: UIMessage[]) {
  try {
    const conv = await db
      .select({ userId: conversation.userId })
      .from(conversation)
      .where(eq(conversation.id, chatId))
      .limit(1);

    if (conv.length === 0) {
      throw new Error("conversation not found yet...");
    }

    const existingMessages = await db
      .select({ id: message.id })
      .from(message)
      .where(eq(message.conversationId, chatId));

    const existingMessageIds = existingMessages.map((m) => m.id);

    const newMessages = messages.filter(
      (msg) => !existingMessageIds.includes(msg.id),
    );

    if (newMessages.length > 0) {
      const messageData = newMessages.map((msg) => {
        const textPart = msg.parts.find((part) => part.type === "text");

        const content = textPart?.text || "";

        return {
          id: msg.id,
          conversationId: chatId,
          userId: conv[0].userId,
          role: msg.role,
          content,
        };
      });

      await db.insert(message).values(messageData);
    }
    await db
      .update(conversation)
      .set({ updatedAt: new Date() })
      .where(eq(conversation.id, chatId));
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Something went wrong",
    );
  }
}

export async function updateChat({
  conversationId,
  messages,
}: {
  conversationId: string;
  messages: UIMessage[];
}): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(message)
        .where(eq(message.conversationId, conversationId));

      const messagesToInsert = messages.map((msg) => ({
        id: crypto.randomUUID(),
        conversationId,
        role: msg.role,
        content: msg.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join(""),
      }));

      if (messagesToInsert.length > 0) {
        await tx.insert(message).values(messagesToInsert);
      }
    });
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Something went wrong",
    );
  }
}

export async function deleteChat(conversationId: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(message)
        .where(eq(message.conversationId, conversationId));

      await tx.delete(conversation).where(eq(conversation.id, conversationId));
    });
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Something went wrong",
    );
  }
}
