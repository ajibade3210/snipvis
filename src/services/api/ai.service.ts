import { API_ROUTES } from "@/constants/routes";
import { analyzeHookResponseSchema } from "@/lib/validations";
import type {
  AnalyzeHookInput,
  AnalyzeHookResponse,
} from "@/types/hook-analysis";
import { api } from "./client";

export const aiService = {
  analyzeHook: (payload: AnalyzeHookInput) =>
    api<AnalyzeHookResponse>(API_ROUTES.ANALYZE_HOOK, {
      method: "POST",
      body: JSON.stringify(payload),
      schema: analyzeHookResponseSchema,
    }),
};
