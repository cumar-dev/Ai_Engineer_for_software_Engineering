import { redirect } from "next/navigation";
import { getUserInfo } from "@/server/user";
import { createConversation } from "@/lib/chat";

export default async function NewChatPage() {
  const session = await getUserInfo();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const chatId = await createConversation({
    userId: session.user.id,
    title: "New chat",
  });

  if (!chatId) {
    throw new Error("Failed to create conversation");
  }

  redirect(`/chat/${chatId}`);
}