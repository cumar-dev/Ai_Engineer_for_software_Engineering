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

import { MessageSquare, Plus, Bot, Trash2, LogOut } from "lucide-react";
import { logOut } from "@/server/user";

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
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (!confirmed) return;

    try {
      setLoggingOut(true);

      await logOut();

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleNewChat = () => {
    router.push("/chat/new");
  };

  const handleDeleteChat = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?",
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
      <SidebarHeader className="gap-3 p-3">
        {/* Brand */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
            <Bot size={20} />
          </div>

          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">DARDAR Chatpot</p>
            <p className="truncate text-xs text-muted-foreground">
              Ask me anything
            </p>
          </div>
        </div>

        {/* New chat */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New Chat"
              onClick={handleNewChat}
              className="h-10 justify-center bg-blue-600 font-medium text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 hover:text-white active:bg-blue-700 active:text-white group-data-[collapsible=icon]:justify-center"
            >
              <Plus />
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wide">
            Recent Conversations
          </SidebarGroupLabel>

          <SidebarMenu className="mt-1 gap-0.5">
            {conversations.map((conversation) => {
              const active = pathname === `/chat/${conversation.id}`;

              return (
                <SidebarMenuItem key={conversation.id}>
                  <div className="group relative">
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={conversation.title}
                      onClick={() => router.push(`/chat/${conversation.id}`)}
                      className="pr-9 transition data-[active=true]:bg-blue-50 data-[active=true]:font-medium data-[active=true]:text-blue-700 dark:data-[active=true]:bg-blue-500/15 dark:data-[active=true]:text-blue-300"
                    >
                      <MessageSquare />
                      <span className="truncate">{conversation.title}</span>
                    </SidebarMenuButton>

                    <button
                      type="button"
                      onClick={() => handleDeleteChat(conversation.id)}
                      disabled={deletingId === conversation.id}
                      title="Delete conversation"
                      aria-label={`Delete ${conversation.title}`}
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive hover:text-white focus-visible:opacity-100 disabled:opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 group-data-[collapsible=icon]:hidden"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </SidebarMenuItem>
              );
            })}

            {conversations.length === 0 && (
              <div className="mx-2 mt-2 flex flex-col items-center gap-2 rounded-xl border border-dashed px-3 py-6 text-center group-data-[collapsible=icon]:hidden">
                <MessageSquare size={20} className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  No conversations yet.
                  <br />
                  Start a new chat above.
                </p>
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              <LogOut />
              <span>{loggingOut ? "Logging out..." : "Log out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
