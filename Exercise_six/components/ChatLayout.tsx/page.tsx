"use client";

import { UIMessage } from "ai";
import { Bot } from "lucide-react";

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

      <SidebarInset className="h-svh min-h-0 overflow-hidden bg-background">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/30">
              <Bot size={16} />
            </div>

            <h2 className="text-sm font-semibold tracking-tight">
              DARDAR Assistant
            </h2>
          </div>
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