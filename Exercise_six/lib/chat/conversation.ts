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
}: createConversation) {
  try {
    const conversationID = nanoid();
    await db.insert(conversation).values({
      id: conversationID,
      title,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return conversationID;
  } catch (error: unknown) {
    console.error(
      error instanceof Error ? error.message : "Something went wrong",
    );
  }
}

export async function getUserConversation(userId: string) {
  try {
    const user = await db
      .select()
      .from(conversation)
      .where(eq(conversation.userId, userId))
      .orderBy(desc(conversation.createdAt));
    return user;
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Something went wrong",
    );
  }
}

export async function getUserConversationById({
  userId,
  conversationId,
}: getUserConversationById) {
  try {
    const [user] = await db
      .select()
      .from(conversation)
      .where(
        and(
          eq(conversation.userId, userId),
          eq(conversation.id, conversationId),
        ),
      ).limit(1);
      return user;
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Something went wrong",
    );
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
      and(
        eq(conversation.id, conversationId),
        eq(conversation.userId, userId),
      ),
    )
    .returning();

  return updatedConversation;
}

export async function deleteConversation(conversationId: string) {
  const [deletedConversation] = await db
    .delete(conversation)
    .where(eq(conversation.id, conversationId))
    .returning();

  return deletedConversation;
}