import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chatrooms: defineTable({
    name: v.string(),
    owner: v.string(), // Clerk user ID
    visitors: v.array(v.string()), // Clerk user ID's
    radius: v.string(),
    ownerLocation: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  }).index("by_owner", ["owner"]),

  messages: defineTable({
    by: v.string(), // Clerk user ID
    message: v.string(),
    chatroom: v.id("chatrooms"),
  })
    .index("by_chatroom", ["chatroom"])
    .index("by_user", ["by"]),

  userChatroomAccess: defineTable({
    user_clerk_id: v.string(),
    chatroom_id: v.id("chatrooms"),
    firstAccessTime: v.number(), // Timestamp when user first sent a message
  })
    .index("by_user_and_chatroom", ["user_clerk_id", "chatroom_id"])
    .index("by_chatroom", ["chatroom_id"]),
});
