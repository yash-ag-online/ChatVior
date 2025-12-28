import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getDistanceInKm } from "../helpers";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export const getChatRoomMessages = query({
  args: {
    chatroom_id: v.id("chatrooms"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatroom", (q) => q.eq("chatroom", args.chatroom_id))
      .order("desc")
      .collect();

    return {
      messages,
    };
  },
});

export const checkUserAccess = query({
  args: {
    chatroom_id: v.id("chatrooms"),
    user_clerk_id: v.string(),
  },
  handler: async (ctx, args) => {
    const access = await ctx.db
      .query("userChatroomAccess")
      .withIndex("by_user_and_chatroom", (q) =>
        q
          .eq("user_clerk_id", args.user_clerk_id)
          .eq("chatroom_id", args.chatroom_id),
      )
      .first();

    if (!access) {
      return {
        canSend: true,
        remainingTime: TWO_HOURS_MS,
        isRestricted: false,
      };
    }

    const currentTime = Date.now();
    const elapsedTime = currentTime - access.firstAccessTime;
    const remainingTime = TWO_HOURS_MS - elapsedTime;
    const isRestricted = elapsedTime >= TWO_HOURS_MS;

    return {
      canSend: !isRestricted,
      remainingTime: Math.max(0, remainingTime),
      isRestricted,
      firstAccessTime: access.firstAccessTime,
    };
  },
});

export const sendMessage = mutation({
  args: {
    chatroom_id: v.id("chatrooms"),
    message: v.string(),
    user_clerk_id: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.user_clerk_id) {
      throw new Error("Unauthorized: You must be logged in to send a message");
    }

    if (!args.message.trim()) {
      throw new Error("Message cannot be empty");
    }

    const chatroom = await ctx.db.get(args.chatroom_id);
    if (!chatroom) {
      throw new Error("Chatroom not found");
    }

    const access = await ctx.db
      .query("userChatroomAccess")
      .withIndex("by_user_and_chatroom", (q) =>
        q
          .eq("user_clerk_id", args.user_clerk_id)
          .eq("chatroom_id", args.chatroom_id),
      )
      .first();

    const currentTime = Date.now();

    if (access) {
      const elapsedTime = currentTime - access.firstAccessTime;
      if (elapsedTime >= TWO_HOURS_MS) {
        throw new Error(
          "Your 2-hour access period has expired. You can no longer send messages in this chatroom.",
        );
      }
    } else {
      await ctx.db.insert("userChatroomAccess", {
        user_clerk_id: args.user_clerk_id,
        chatroom_id: args.chatroom_id,
        firstAccessTime: currentTime,
      });
    }

    const messageId = await ctx.db.insert("messages", {
      by: args.user_clerk_id,
      message: args.message.trim(),
      chatroom: args.chatroom_id,
    });

    if (!chatroom.visitors.includes(args.user_clerk_id)) {
      await ctx.db.patch(args.chatroom_id, {
        visitors: [...chatroom.visitors, args.user_clerk_id],
      });
    }

    return messageId;
  },
});

export const getMyChatRooms = query({
  args: {
    owner_clerk_id: v.string(),
  },
  handler: async (ctx, args) => {
    const rooms = await ctx.db
      .query("chatrooms")
      .withIndex("by_owner", (q) => q.eq("owner", args.owner_clerk_id))
      .collect();

    return {
      rooms,
    };
  },
});

export const getAvailableChatRooms = query({
  args: {
    userLat: v.number(),
    userLng: v.number(),
  },
  handler: async (ctx, args) => {
    const allRooms = await ctx.db.query("chatrooms").collect();

    const availableRooms = allRooms
      .map((room) => {
        const distance = getDistanceInKm(
          args.userLat,
          args.userLng,
          room.ownerLocation.lat,
          room.ownerLocation.lng,
        );

        const radiusKm = parseInt(room.radius);

        if (distance <= radiusKm) {
          return {
            ...room,
            distance: Math.round(distance * 100) / 100,
          };
        }

        return null;
      })
      .filter((room) => room !== null)
      .sort((a, b) => a!.distance - b!.distance);

    return { rooms: availableRooms };
  },
});

export const getChatRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db.query("chatrooms").collect();

    return {
      rooms,
    };
  },
});

export const getChatRoomById = query({
  args: {
    id: v.id("chatrooms"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.id);

    return {
      room,
    };
  },
});

export const createChatRoom = mutation({
  args: {
    name: v.string(),
    radius: v.string(),
    owner_clerk_id: v.string(),
    ownerLat: v.number(),
    ownerLng: v.number(),
  },
  handler: async (ctx, args) => {
    if (!args.owner_clerk_id) {
      throw new Error(
        "Unauthorized: You must be logged in to create a chatroom",
      );
    }

    const chatroomId = await ctx.db.insert("chatrooms", {
      name: args.name,
      owner: args.owner_clerk_id,
      visitors: [],
      radius: args.radius,
      ownerLocation: {
        lat: args.ownerLat,
        lng: args.ownerLng,
      },
    });

    return chatroomId;
  },
});
