// bot/src/core/server-map.js
//
// SINGLE SOURCE OF TRUTH for the target Discord server structure —
// server name, roles, categories, channels, and visibility rules.
//
// scripts/bootstrap-server.js reads this to create/rename the live
// server. Runtime modules (welcome, verification, roles) read this
// (via core/discord-sync.js, which resolves names to live IDs stored
// in the database) instead of hardcoding IDs anywhere.
//
// Changing the server structure means editing THIS FILE ONLY, then
// re-running the bootstrap script.

export const SERVER_NAME = "Pawan Satoshi Academy";

// Channel types, matching discord.js ChannelType enum values used in
// bootstrap-server.js: 'category' | 'text' | 'forum' | 'voice'

// Visibility controls the permission overwrites applied to a category:
//  - "public"   : @everyone can view (pre-verification)
//  - "verified" : only the Verified role (and above) can view
//  - "staff"    : only Admin / Moderator / Mentor can view

export const ROLE_DEFINITIONS = [
  {
    key: "admin",
    name: "Admin",
    color: "#E74C3C",
    hoist: true,
    mentionable: false,
    // Deliberately NOT Administrator — least-privilege, matches doc 05/07.
    permissions: [
      "ManageGuild",
      "ManageChannels",
      "ManageRoles",
      "KickMembers",
      "BanMembers",
      "ManageMessages",
      "ManageNicknames",
      "MentionEveryone",
      "ViewAuditLog",
      "ManageWebhooks",
      "ModerateMembers"
    ]
  },
  {
    key: "moderator",
    name: "Moderator",
    color: "#E67E22",
    hoist: true,
    mentionable: false,
    permissions: [
      "KickMembers",
      "BanMembers",
      "ManageMessages",
      "ManageNicknames",
      "ViewAuditLog",
      "ModerateMembers"
    ]
  },
  {
    key: "mentor",
    name: "Mentor",
    color: "#3498DB",
    hoist: true,
    mentionable: true,
    permissions: ["ManageMessages", "ModerateMembers"] // scoped further to Academy channels via overwrites
  },
  {
    key: "og",
    name: "OG",
    color: "#9B59B6",
    hoist: true,
    mentionable: false,
    permissions: []
  },
  {
    key: "active",
    name: "Active",
    color: "#2ECC71",
    hoist: true,
    mentionable: false,
    permissions: []
  },
  {
    key: "verified",
    name: "Verified",
    color: "#95A5A6",
    hoist: false,
    mentionable: false,
    permissions: []
  },
  {
    key: "member",
    name: "Member",
    color: "#BDC3C7",
    hoist: false,
    mentionable: false,
    permissions: []
  }
];

// Roles above this rank in the array are considered "staff" for the
// purposes of the "staff" visibility category.
export const STAFF_ROLE_KEYS = ["admin", "moderator", "mentor"];

export const CATEGORY_DEFINITIONS = [
  {
    key: "start-here",
    name: "🟢 START HERE",
    visibility: "public",
    channels: [
      { key: "welcome", name: "welcome", type: "text" },
      { key: "rules", name: "rules", type: "text" },
      { key: "verify", name: "verify", type: "text" },
      { key: "announcements", name: "announcements", type: "text" }
    ]
  },
  {
    key: "academy",
    name: "📚 ACADEMY",
    visibility: "verified",
    channels: [
      // One Academy Hub forum — Orientation, Class 1-12, Graduation,
      // and all 22 subjects live as forum threads here, not as
      // separate channels. This is what keeps visible channel count
      // low despite the full curriculum.
      { key: "academy-hub", name: "academy-hub", type: "forum" },
      { key: "quiz-arena", name: "quiz-arena", type: "text" },
      { key: "certificates", name: "certificates", type: "text" }
    ]
  },
  {
    key: "safety-hub",
    name: "🛡️ SAFETY HUB",
    visibility: "verified",
    channels: [
      // Cyber security, password safety, digital payments, wallet
      // security, and scam alerts all live as forum threads here.
      { key: "security-tips", name: "security-tips", type: "forum" }
    ]
  },
  {
    key: "web3-crypto",
    name: "🪙 WEB3 & CRYPTO",
    visibility: "verified",
    channels: [
      { key: "crypto-news", name: "crypto-news", type: "text" },
      { key: "airdrops-testnets", name: "airdrops-testnets", type: "text" },
      { key: "ambassador-hub", name: "ambassador-hub", type: "text" }
    ]
  },
  {
    key: "community",
    name: "👥 COMMUNITY",
    visibility: "verified",
    channels: [
      { key: "general-chat", name: "general-chat", type: "text" },
      { key: "introductions", name: "introductions", type: "text" },
      { key: "questions", name: "questions", type: "text" },
      { key: "showcase", name: "showcase", type: "text" },
      { key: "suggestions", name: "suggestions", type: "text" },
      { key: "leaderboard", name: "leaderboard", type: "text" },
      { key: "hall-of-fame", name: "hall-of-fame", type: "text" },
      { key: "gaming", name: "gaming", type: "text" }
    ]
  },
  {
    key: "mentorship",
    name: "🧑‍🏫 MENTORSHIP",
    visibility: "verified",
    channels: [
      { key: "mentor-help", name: "mentor-help", type: "text" },
      { key: "study-groups", name: "study-groups", type: "forum" },
      { key: "career-guidance", name: "career-guidance", type: "text" }
    ]
  },
  {
    key: "support",
    name: "🆘 SUPPORT",
    visibility: "verified",
    channels: [
      { key: "help", name: "help", type: "text" },
      { key: "tickets", name: "tickets", type: "text" },
      { key: "bot-commands", name: "bot-commands", type: "text" }
    ]
  },
  {
    key: "voice",
    name: "🔊 VOICE",
    visibility: "verified",
    channels: [
      { key: "weekly-meeting", name: "weekly-meeting", type: "voice" },
      { key: "community-lounge", name: "community-lounge", type: "voice" },
      { key: "study-room", name: "study-room", type: "voice" }
    ]
  },
  {
    key: "staff-only",
    name: "🔒 STAFF ONLY",
    visibility: "staff",
    channels: [
      { key: "staff-chat", name: "staff-chat", type: "text" },
      { key: "mod-logs", name: "mod-logs", type: "text" },
      { key: "audit-logs", name: "audit-logs", type: "text" }
    ]
  },
  {
    key: "archive",
    name: "🗄️ ARCHIVE",
    visibility: "staff",
    channels: [{ key: "archive", name: "archive", type: "text" }]
  }
];

// Existing channels on the live server that should be RENAMED and
// MOVED into the new structure instead of being treated as new
// creations. Matched by current name (case-insensitive) the first
// time bootstrap runs; after that, matched by stored Discord ID.
export const LEGACY_CHANNEL_REMAPS = [
  { currentName: "general", newCategoryKey: "community", newChannelKey: "general-chat" },
  { currentName: "General", newCategoryKey: "voice", newChannelKey: "community-lounge" }
];

// Recommended bot invite permissions — deliberately excludes
// Administrator. Used to generate the invite link and to validate the
// bot's actual permissions at bootstrap/startup time.
export const BOT_RECOMMENDED_PERMISSIONS = [
  "ViewChannel",
  "SendMessages",
  "SendMessagesInThreads",
  "CreatePublicThreads",
  "EmbedLinks",
  "AttachFiles",
  "ReadMessageHistory",
  "ManageChannels",
  "ManageRoles",
  "ManageGuild",
  "ManageMessages",
  "ManageNicknames",
  "ModerateMembers",
  "KickMembers",
  "BanMembers",
  "ManageWebhooks",
  "ViewAuditLog",
  "UseApplicationCommands",
  "ManageThreads"
];

export function getCategoryByKey(key) {
  return CATEGORY_DEFINITIONS.find((c) => c.key === key) || null;
}

export function getRoleByKey(key) {
  return ROLE_DEFINITIONS.find((r) => r.key === key) || null;
}
