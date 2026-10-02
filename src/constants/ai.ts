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
    textModel: process.env.OPENROUTER_TEXT_MODEL ?? "openrouter/free",
    visionModel:
      process.env.OPENROUTER_VISION_MODEL ?? "meta-llama/llama-4-maverick:free",
    extraHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Snipvis OS",
    },
  },
  gemini: {
    baseUrl:
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    apiKey: process.env.GEMINI_API_KEY ?? "",
    textModel: process.env.GEMINI_TEXT_MODEL ?? "gemini-3.8-flash",
    visionModel: process.env.GEMINI_VISION_MODEL ?? "gemini-3.8-flash",
  },
};

export function getAiProviderConfig() {
  const currentProvider = (process.env.API_PROVIDER ??
    "deepseek") as ApiProvider;
  const config = PROVIDER_CONFIGS[currentProvider] || PROVIDER_CONFIGS.deepseek;
  let dynamicApiKey = config.apiKey;
  let dynamicTextModel = config.textModel;

  if (currentProvider === "gemini") {
    dynamicApiKey = process.env.GEMINI_API_KEY || config.apiKey;
    dynamicTextModel = process.env.GEMINI_TEXT_MODEL || "gemini-3.8-flash";
  } else if (currentProvider === "openrouter") {
    dynamicApiKey = process.env.OPENROUTER_API_KEY || config.apiKey;
    dynamicTextModel = process.env.OPENROUTER_TEXT_MODEL || "openrouter/free";
  } else {
    dynamicApiKey = process.env.DEEPSEEK_API_KEY || config.apiKey;
    dynamicTextModel = process.env.DEEPSEEK_TEXT_MODEL || "deepseek-chat";
  }

  return {
    provider: currentProvider,
    baseUrl: config.baseUrl,
    apiKey: dynamicApiKey,
    textModel: dynamicTextModel,
    visionModel: config.visionModel,
    extraHeaders: config.extraHeaders,
    TIMEOUT_MS: 90000,
    SCRAPE_TIMEOUT_MS: 3000,
    TEMPERATURE: 0.3,
  };
}

export const AI_PROVIDER_CONFIG = {
  get provider() {
    return (process.env.API_PROVIDER ?? "deepseek") as ApiProvider;
  },
  get baseUrl() {
    return getAiProviderConfig().baseUrl;
  },
  get apiKey() {
    return getAiProviderConfig().apiKey;
  },
  get textModel() {
    return getAiProviderConfig().textModel;
  },
  get visionModel() {
    return getAiProviderConfig().visionModel;
  },
  get extraHeaders() {
    return getAiProviderConfig().extraHeaders;
  },
  TIMEOUT_MS: 90000,
  SCRAPE_TIMEOUT_MS: 3000,
  TEMPERATURE: 0.3,
};

// Kept for backward compat — aliases to AI_PROVIDER_CONFIG
export const DEEPSEEK_CONFIG = AI_PROVIDER_CONFIG;

export const HOOK_EMOTIONS = [
  "Curiosity",
  "Fear",
  "Ambition",
  "Surprise",
  "Desire",
  "Outrage",
  "Belonging",
  "Urgency",
  "Nostalgia",
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
  Desire: {
    bg: "bg-pink-500/10",
    text: "text-pink-500",
    border: "border-pink-500/20",
  },
  Outrage: {
    bg: "bg-rose-600/10",
    text: "text-rose-600",
    border: "border-rose-600/20",
  },
  Belonging: {
    bg: "bg-teal-500/10",
    text: "text-teal-500",
    border: "border-teal-500/20",
  },
  Urgency: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/20",
  },
  Nostalgia: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-500",
    border: "border-indigo-500/20",
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
