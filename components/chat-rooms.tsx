"use client";

import ChatRoomCard from "@/components/chat-room-card";
import { useLocation } from "@/contexts/location-context";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

const ChatRooms = () => {
  const locationCtx = useLocation();
  const location = locationCtx?.location;

  const chatrooms = useQuery(
    api.tasks.getAvailableChatRooms,
    location ? { userLat: location.lat, userLng: location.lng } : "skip",
  )?.rooms;

  if (!locationCtx || !location) {
    return <></>;
  }

  if (!chatrooms) {
    return <></>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-2 gap-4">
      {chatrooms.map((c) => {
        return (
          <ChatRoomCard
            key={c._id}
            name={c.name}
            _id={c._id}
            radius={c.radius}
          />
        );
      })}
    </div>
  );
};

export default ChatRooms;
