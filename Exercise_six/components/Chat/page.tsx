import React, { useState } from 'react'
import { DefaultChatTransport, UIMessage } from 'ai';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import {useChat} from "@ai-sdk/react";
interface propsChat {
    chatId: string;
    initialMessage: UIMessage[]
}
const Chat = ({chatId, initialMessage}: propsChat) => {
  const {isPending, data: session, error} = useSession();
  const [input, setInput] = useState("");
  const router = useRouter();
  const {messages, sendMessage, status, stop} = useChat({
    id: chatId,
    messages: initialMessage,
    transport: new DefaultChatTransport({
      api: "/api/chat"
    })
  });
  return (
    <>
    
    </>
  )
}

export default Chat;