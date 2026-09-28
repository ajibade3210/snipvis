import { QUERY_KEYS } from "@/lib/constants";
import { channelService } from "@/services/api/channel.service";
import type { CreateChannelInput } from "@/types/channel";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useChannels = () =>
  useQuery({
    queryKey: [QUERY_KEYS.CHANNELS],
    queryFn: channelService.list,
  });

export const useCreateChannel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChannelInput) => channelService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
    },
  });
};
