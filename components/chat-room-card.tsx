import Link from "next/link";

const ChatRoomCard = ({
  name,
  _id,
  radius,
}: {
  name: string;
  _id: string;
  radius: string;
}) => {
  return (
    <Link
      href={`/chatrooms/${_id}`}
      className="bg-background border rounded-sm shadow p-4"
    >
      <div className="flex flex-col overflow-hidden">
        <div className="w-full flex items-center justify-between">
          <h2>{name}</h2>{" "}
          <span className="h-7 w-12 flex items-center justify-center bg-chart-2 text-background rounded-full">
            {radius}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2 wrap-break-word">
          {_id}
        </p>
      </div>
    </Link>
  );
};

export default ChatRoomCard;
