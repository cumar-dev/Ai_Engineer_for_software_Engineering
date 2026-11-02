import ChatLayout from "@/components/ChatLayout.tsx/page";
import { getUserConversation, loadChat } from "@/lib/chat";
import { getUserInfo } from "@/server/user";
import { redirect } from "next/navigation";
export const instant = false;
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;

  const session = await getUserInfo();

if (!session) {
  redirect("/login");
}

const messages = await loadChat(id, session.user.id);

const conversations =
  (await getUserConversation(session.user.id)) ?? [];


return (
  <ChatLayout
    chatId={id}
    initialMessage={messages}
    conversations={conversations}
  />
);
}