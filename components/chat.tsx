"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { type Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Send, Loader2, Clock } from "lucide-react";
import { FormEvent, useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const Chat = ({ id }: { id: string }) => {
  const { user } = useUser();
  const userId = user?.id;

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const room = useQuery(api.tasks.getChatRoomById, {
    id: id as Id<"chatrooms">,
  })?.room;

  const messages = useQuery(api.tasks.getChatRoomMessages, {
    chatroom_id: id as Id<"chatrooms">,
  })?.messages;

  // Check user's access status
  const userAccess = useQuery(
    api.tasks.checkUserAccess,
    userId
      ? {
          chatroom_id: id as Id<"chatrooms">,
          user_clerk_id: userId,
        }
      : "skip",
  );

  const sendMessageMutation = useMutation(api.tasks.sendMessage);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert("You must be logged in to send messages");
      return;
    }

    if (!message.trim()) {
      return;
    }

    if (userAccess?.isRestricted) {
      alert(
        "Your 2-hour access period has expired. You can no longer send messages in this chatroom.",
      );
      return;
    }

    try {
      setIsLoading(true);
      await sendMessageMutation({
        chatroom_id: id as Id<"chatrooms">,
        message: message,
        user_clerk_id: userId,
      });
      setMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Failed to send message:", error);
      alert(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key to send (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as FormEvent);
    }
  };

  // Format remaining time
  const formatRemainingTime = (ms: number) => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isRestricted = userAccess?.isRestricted ?? false;
  const canSend = userAccess?.canSend ?? true;

  return (
    <>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 max-w-4xl w-full mx-auto md:border-x border-dashed border-foreground relative flex flex-col">
          {/* Header */}
          <div className="w-full p-4 bg-background sticky top-17 z-10 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-chart-3">
                  {room.name}
                </h1>
                <p className="text-muted-foreground text-sm hidden sm:block">
                  {room._id}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-7 px-3 flex items-center justify-center bg-chart-2 text-background rounded-full text-sm">
                  {room.radius}
                </span>
                {userAccess && !isRestricted && (
                  <span className="h-7 px-3 flex items-center gap-1 justify-center bg-blue-500 text-white rounded-full text-xs">
                    <Clock className="w-3 h-3" />
                    {formatRemainingTime(userAccess.remainingTime)}
                  </span>
                )}
                {isRestricted && (
                  <span className="h-7 px-3 flex items-center gap-1 justify-center bg-red-500 text-white rounded-full text-xs">
                    Access Expired
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!messages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              <>
                {messages
                  .slice()
                  .reverse()
                  .map((msg) => {
                    const isOwn = msg.by === userId;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isOwn ? "justify-end text-right" : "justify-start text-left"}`}
                      >
                        <div
                          className={`p-3 rounded-lg w-full max-w-[80%] wrap-break-word  text-background ${
                            isOwn ? "bg-chart-3" : "bg-foreground/80"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <p className={`text-xs mt-1 opacity-80`}>
                            {new Date(msg._creationTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                          <p className={`opacity-80 text-xs`}>by:- {msg.by}</p>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 inset-x-0 shrink-0 border-t border-dashed border-foreground">
        {isRestricted && (
          <div className="w-full max-w-4xl mx-auto md:border-x border-dashed border-foreground bg-red-50 dark:bg-red-950/20 p-3 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              Your 2-hour access period has expired. You can no longer send
              messages in this chatroom.
            </p>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl mx-auto md:border-x border-dashed border-foreground bg-background flex items-end p-4 gap-4"
        >
          <Textarea
            className="bg-muted resize-none"
            placeholder={
              isRestricted
                ? "You can no longer send messages (2-hour limit expired)"
                : "Write your message here... (Enter to send, Shift+Enter for new line)"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isRestricted}
            rows={3}
          />
          <Button
            type="submit"
            disabled={isLoading || !message.trim() || isRestricted}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send />
            )}
          </Button>
        </form>
      </div>
    </>
  );
};

export default Chat;
