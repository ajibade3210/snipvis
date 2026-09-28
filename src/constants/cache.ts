export const CACHE_KEYS = {
  PROJECTS_LIST: (userId: string) => `projects:list:${userId}`,
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  CHANNELS_LIST: (userId: string) => `channels:list:${userId}`,
} as const;

export const CACHE_TTL = {
  PROJECTS_LIST_SECONDS: 60,
  USER_PROFILE_SECONDS: 300,
  CHANNELS_LIST_SECONDS: 60,
} as const;

export const STORAGE_KEYS = {
  THEME: "sv-theme",
  THEME_RESET: "sv-theme-reset-v1",
  SIDEBAR_COLLAPSED: "sv-sidebar-collapsed",
} as const;

export const QUERY_KEYS = {
  PROJECTS: "projects",
  INSPIRATIONS: "inspirations",
  ASSETS: "assets",
  USER_PROFILE: "user-profile",
  CHANNELS: "channels",
} as const;

export const QUERY_SUBKEYS = {
  GLOBAL: "global",
  PROJECT: "project",
  FAV: "fav",
  ALL: "all",
} as const;

export const FILTER_ALL = "ALL" as const;
