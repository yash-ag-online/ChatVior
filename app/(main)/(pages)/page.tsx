import ChatRooms from "@/components/chat-rooms";

const page = () => {
  return (
    <div className="w-full">
      <div className="p-4">
        <h1 className="text-2xl font-semibold text-chart-3">Chat Rooms</h1>
        <ChatRooms />
      </div>
    </div>
  );
};

export default page;
