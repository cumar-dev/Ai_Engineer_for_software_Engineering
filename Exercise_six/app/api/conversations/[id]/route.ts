import { NextResponse } from "next/server";
import { getUserInfo } from "@/server/user";
import { deleteConversation } from "@/lib/chat";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: Request,
  { params }: Props,
) {
  try {
    const session = await getUserInfo();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    console.log("Deleting conversation:", id);

    const deleted = await deleteConversation(
      id,
      session.user.id,
    );

    if (!deleted) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE conversation error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}