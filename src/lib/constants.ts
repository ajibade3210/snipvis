export const CACHE_KEYS = {
  PROJECTS_LIST: "projects:list",
} as const;

export const CACHE_TTL = {
  PROJECTS_LIST_SECONDS: 60,
} as const;

export const API_ROUTES = {
  PROJECTS: "/api/projects",
  INSPIRATIONS: "/api/inspirations",
  INSPIRATION_TAG: "/api/inspirations/tag",
  ASSETS: "/api/assets",
  YOUTUBE: "/api/youtube",
  SEED: "/api/seed",
} as const;
