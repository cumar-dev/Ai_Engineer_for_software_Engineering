
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  MessageSquare,
  Plus,
  Settings,
  Bot,
  Trash2,
} from "lucide-react";

interface Conversation {
  id: string;
  title: string;
}

interface AppSidebarProps {
  conversations: Conversation[];
}

const AppSidebar = ({ conversations }: AppSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleNewChat = () => {
    router.push("/chat/new");
  };

  const handleDeleteChat = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      if (pathname === `/chat/${id}`) {
        router.replace("/chat");
      }

      router.refresh();
    } catch (error) {
      console.error("Delete chat error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="AI Assistant"
              onClick={handleNewChat}
            >
              <Bot />
              <span>AI Assistant</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New Chat"
              onClick={handleNewChat}
            >
              <Plus />
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Recent Conversations
          </SidebarGroupLabel>

          <SidebarMenu>
            {conversations.map((conversation) => {
              const active =
                pathname === `/chat/${conversation.id}`;

              return (
                <SidebarMenuItem key={conversation.id}>
                  <div className="group relative">
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={conversation.title}
                      onClick={() =>
                        router.push(`/chat/${conversation.id}`)
                      }
                      className="pr-9"
                    >
                      <MessageSquare />
                      <span className="truncate">
                        {conversation.title}
                      </span>
                    </SidebarMenuButton>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteChat(conversation.id)
                      }
                      disabled={deletingId === conversation.id}
                      title="Delete conversation"
                      aria-label={`Delete ${conversation.title}`}
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive hover:text-white group-hover:opacity-100 group-focus-within:opacity-100 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </SidebarMenuItem>
              );
            })}

            {conversations.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No conversations yet.
              </p>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              onClick={() => router.push("/settings")}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
