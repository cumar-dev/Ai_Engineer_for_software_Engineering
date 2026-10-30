import Chat from "@/components/Chat/page";
import { loadChat } from "@/lib/chat";
import { getUserInfo } from "@/server/user";
import { redirect } from "next/navigation";

export const instant = false;
interface pageProps {
  params: Promise<{ id: string }>;
}

export default async function chatPage({params}: pageProps) {
const {id} = await params;
  const session = await getUserInfo();
  if (!session) {
    redirect("/login");
  }
const messages = await loadChat(id);
return(
    <Chat
     initialMessage={messages}
      chatId={id}
     />
)
}