export const CACHE_KEYS = {
  PROJECTS_LIST: "projects:list",
  USER_PROFILE: "user:profile",
} as const;

export const CACHE_TTL = {
  PROJECTS_LIST_SECONDS: 60,
  USER_PROFILE_SECONDS: 300,
} as const;

export const STORAGE_KEYS = {
  THEME: "sv-theme",
  SIDEBAR_COLLAPSED: "sv-sidebar-collapsed",
} as const;

export const QUERY_KEYS = {
  PROJECTS: "projects",
  INSPIRATIONS: "inspirations",
  ASSETS: "assets",
  USER_PROFILE: "user-profile",
} as const;

export const QUERY_SUBKEYS = {
  GLOBAL: "global",
  PROJECT: "project",
  FAV: "fav",
  ALL: "all",
} as const;

export const FILTER_ALL = "ALL" as const;
