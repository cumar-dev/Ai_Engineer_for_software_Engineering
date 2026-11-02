"use client";

import { UIMessage } from "ai";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "../AppSidebar.tsx/page";
import Chat from "../Chat/page";

interface Conversation {
  id: string;
  title: string;
}

interface ChatLayoutProps {
  chatId: string;
  initialMessage: UIMessage[];
  conversations: Conversation[];
}

const ChatLayout = ({
  chatId,
  initialMessage,
  conversations,
}: ChatLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar conversations={conversations} />

      <SidebarInset className="min-h-0">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />

          <h2 className="font-semibold">AI Assistant</h2>
        </header>

        {/* Main Chat */}
        <div className="min-h-0 flex-1">
          <Chat chatId={chatId} initialMessage={initialMessage} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatLayout;
