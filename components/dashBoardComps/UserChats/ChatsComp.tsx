import { useEffect, useState } from "react";
import ChatList from "./ChatsList";
import Chat from "./Chat";
import { useChatStore } from "../../../store/chat";

const ChatsComp = () => {
  const [currentChat, setCurrentChat] = useState<number | null>(null);
  const { rooms } = useChatStore((state) => ({
    rooms: state.chatState.adminRooms,
  }));
  return (
    <>
      {currentChat !== null ? (
        <Chat chatRoom={rooms[currentChat]} setCurrentChat={setCurrentChat} />
      ) : (
        <ChatList rooms={rooms} setCurrentChat={setCurrentChat} />
      )}
    </>
  );
};
export default ChatsComp;
