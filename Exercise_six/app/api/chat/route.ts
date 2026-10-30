import { openRouter } from "@/lib/ai";
import { loadChat, saveChat, updateConversation } from "@/lib/chat";
import { getUserInfo } from "@/server/user";

import {
  convertToModelMessages,
  streamText,
  validateUIMessages,
  type UIMessage,
  createIdGenerator,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const user = await getUserInfo();

    if (!user?.user?.id) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Get request body
    const body = await req.json();

    const { messages, message: singleMessage, id: conversationId } = body;

    if (!conversationId) {
      return Response.json(
        { error: "Conversation ID is required" },
        { status: 400 },
      );
    }

    // 3. Verify conversation ownership
    // loadChat should verify that this conversation belongs to user.user.id.
    let allMessages: UIMessage[];

    if (singleMessage) {
      const previousMessages = await loadChat(conversationId);

      allMessages = [...previousMessages, singleMessage];
    } else if (messages) {
      allMessages = messages;
    } else {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    // 4. Validate messages
    let validatedMessages: UIMessage[];

    try {
      validatedMessages = await validateUIMessages({
        messages: allMessages,
      });
    } catch (error) {
      console.error("Message validation failed:", error);

      return Response.json({ error: "Invalid messages" }, { status: 400 });
    }

    // 5. Convert messages for AI model
    const modelMessages = await convertToModelMessages(validatedMessages);

    // 6. Stream AI response
    const result = streamText({
      model: openRouter(
        process.env.OPENROUTER_VISION_MODEL ||
          "nvidia/nemotron-3-ultra-550b-a55b:free",
      ),
      system:
        "You are a helpful AI assistant. Answer clearly and accurately. Analyze uploaded images when provided.",
      messages: modelMessages,
    });

    // 7. Consume stream
    result.consumeStream();

    // 8. Return response and save messages
    return result.toUIMessageStreamResponse({
      originalMessages: validatedMessages,

      generateMessageId: createIdGenerator({
        prefix: "msg_",
        size: 16,
      }),

      onFinish: async ({ messages }) => {
        try {
           await saveChat(conversationId, messages);
        } catch (error) {
          console.error("Error saving chat:", error);
        }
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return new Response("Internal Server Error", {
      status: 500,
    });
  }
}


export async function PATCH(req: Request) {
  try {
    // 1. Authenticate user
    const user = await getUserInfo();

    if (!user?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // 2. Get request body
    const { conversationId, title } = await req.json();

    // 3. Validate data
    if (!conversationId || !title?.trim()) {
      return Response.json(
        { error: "Conversation ID and title are required" },
        { status: 400 },
      );
    }

    // 4. Update conversation
    const updatedConversation = await updateConversation(
      conversationId,
      title.trim(),
      user.user.id,
    );

    if (!updatedConversation) {
      return Response.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // 5. Return updated conversation
    return Response.json({
      message: "Conversation updated successfully",
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("Update chat error:", error);

    return Response.json(
      { error: "Failed to update conversation" },
      { status: 500 },
    );
  }
}