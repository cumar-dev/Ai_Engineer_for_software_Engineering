import { db } from "@/db/drizzle";
import { conversation } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
interface createConversation {
  userId: string;
  title: string;
}
interface getUserConversationById {
  userId: string;
  conversationId: string;
}
export async function createConversation({
  userId,
  title,
}: {
  userId: string;
  title: string;
}) {
  const id = nanoid();

  await db.insert(conversation).values({
    id,
    userId,
    title,
  });

  return id;
}

export async function getUserConversation(userId: string) {
  try {
    const conversations = await db
      .select()
      .from(conversation)
      .where(eq(conversation.userId, userId))
      .orderBy(desc(conversation.updatedAt));

    return conversations;
  } catch (error) {
    console.error("Failed to get user conversations:", error);
    throw error;
  }
}

export async function getUserConversationById({
  userId,
  conversationId,
}: getUserConversationById) {
  try {
    const [result] = await db
      .select()
      .from(conversation)
      .where(
        and(
          eq(conversation.id, conversationId),
          eq(conversation.userId, userId),
        ),
      )
      .limit(1);

    return result ?? null;
  } catch (error) {
    console.error("Get conversation failed:", error);
    throw error;
  }
}

export async function updateConversation(
  conversationId: string,
  title: string,
  userId: string,
) {
  const [updatedConversation] = await db
    .update(conversation)
    .set({
      title,
      updatedAt: new Date(),
    })
    .where(
      and(eq(conversation.id, conversationId), eq(conversation.userId, userId)),
    )
    .returning();

  return updatedConversation;
}

export async function deleteConversation(
  conversationId: string,
  userId: string,
) {
  const [deleted] = await db
    .delete(conversation)
    .where(
      and(
        eq(conversation.id, conversationId),
        eq(conversation.userId, userId),
      ),
    )
    .returning();

  return deleted;
}