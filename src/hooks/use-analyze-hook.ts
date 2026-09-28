import { aiService } from "@/services/api/ai.service";
import type {
  AnalyzeHookInput,
  AnalyzeHookResponse,
} from "@/types/hook-analysis";
import { useMutation } from "@tanstack/react-query";

export function useAnalyzeHook() {
  return useMutation<AnalyzeHookResponse, Error, AnalyzeHookInput>({
    mutationFn: (payload) => aiService.analyzeHook(payload),
  });
}
