import type { ApiProvider } from "@/types";

const provider = (process.env.API_PROVIDER ?? "deepseek") as ApiProvider;

const PROVIDER_CONFIGS: Record<
  ApiProvider,
  {
    baseUrl: string;
    apiKey: string;
    textModel: string;
    visionModel: string;
    extraHeaders?: Record<string, string>;
  }
> = {
  deepseek: {
    baseUrl: "https://api.deepseek.com/chat/completions",
    apiKey: process.env.DEEPSEEK_API_KEY ?? "",
    textModel: process.env.DEEPSEEK_TEXT_MODEL ?? "deepseek-chat",
    visionModel:
      process.env.DEEPSEEK_VISION_MODEL ?? "deepseek-v4-flash-vision-exp",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
    textModel:
      process.env.OPENROUTER_TEXT_MODEL ??
      "deepseek/deepseek-chat-v3-0324:free",
    visionModel:
      process.env.OPENROUTER_VISION_MODEL ?? "meta-llama/llama-4-maverick:free",
    extraHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Snipvis OS",
    },
  },
};

export const AI_PROVIDER_CONFIG = {
  provider,
  ...PROVIDER_CONFIGS[provider],
  TIMEOUT_MS: 35000,
  SCRAPE_TIMEOUT_MS: 3000,
  TEMPERATURE: 0.3,
} as const;

// Kept for backward compat — aliases to AI_PROVIDER_CONFIG
export const DEEPSEEK_CONFIG = AI_PROVIDER_CONFIG;

export const HOOK_EMOTIONS = [
  "Curiosity",
  "Fear",
  "Ambition",
  "Surprise",
  "Urgency",
  "Validation",
] as const;

export const DEFAULT_CHANNEL_NAME = "Creator" as const;

export const HOOK_EMOTION_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Curiosity: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
  },
  Fear: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/20",
  },
  Ambition: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
  },
  Surprise: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
  },
  Urgency: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/20",
  },
  Validation: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
  },
  Default: {
    bg: "bg-[#FF5338]/10",
    text: "text-[#FF5338]",
    border: "border-[#FF5338]/20",
  },
};
