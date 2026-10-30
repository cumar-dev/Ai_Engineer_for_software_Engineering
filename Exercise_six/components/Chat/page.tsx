import React from 'react'
import { UIMessage } from 'ai';
interface propsChat {
    chatId: string;
    initialMessage: UIMessage[]
}
const Chat = ({chatId, initialMessage}: propsChat) => {
  return (
    <div>Chat</div>
  )
}

export default Chat;