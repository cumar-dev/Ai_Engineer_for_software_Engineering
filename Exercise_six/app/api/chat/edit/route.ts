import { getUserConversationById } from "@/lib/chat";
import { deleteMessagesFrom } from "@/lib/chat";
import { getUserInfo } from "@/server/user";

export async function PATCH(req: Request) {
  try {
    const user = await getUserInfo();

    if (!user?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { conversationId, messageId } = await req.json();

    if (!conversationId || !messageId) {
      return Response.json(
        { error: "Conversation ID and message ID are required" },
        { status: 400 },
      );
    }

    const conversationRecord = await getUserConversationById({
      userId: user.user.id,
      conversationId,
    });

    if (!conversationRecord) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const deleted = await deleteMessagesFrom(
      conversationId,
      messageId,
      user.user.id,
    );

    if (!deleted) {
      return Response.json(
        { error: "Message not found" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Messages updated successfully",
    });
  } catch (error) {
    console.error("EDIT MESSAGE ERROR:", error);

    return Response.json(
      { error: "Failed to edit message" },
      { status: 500 },
    );
  }
}