import { thumbnailPromptService } from "@/services/api/thumbnail-prompt.service";
import type { GenerateThumbnailPromptRequest } from "@/types/thumbnail-prompt";
import { useMutation } from "@tanstack/react-query";

export const useGenerateThumbnailPrompt = () => {
  return useMutation({
    mutationFn: (data: GenerateThumbnailPromptRequest) =>
      thumbnailPromptService.generate(data),
  });
};
