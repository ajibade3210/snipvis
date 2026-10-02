"use client";

import { Button } from "@/components/ui/button";
import {
  useChannels,
  useCreateChannel,
  useDeleteChannel,
} from "@/hooks/use-channels";
import type { ChannelRecord } from "@/types/channel";
import { useMemo, useState } from "react";

interface ChannelsViewProps {
  onSelectChannel: (channelId: string) => void;
  onOpenNewProjectForChannel: (channelId: string) => void;
  onChannelDeleted?: (channelId: string) => void;
}

export function ChannelsView({
  onSelectChannel,
  onOpenNewProjectForChannel,
  onChannelDeleted,
}: ChannelsViewProps) {
  const { data: channels = [], isLoading } = useChannels();
  const createChannelMutation = useCreateChannel();
  const deleteChannelMutation = useDeleteChannel();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelLink, setNewChannelLink] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [channelToDelete, setChannelToDelete] = useState<ChannelRecord | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    const q = searchQuery.toLowerCase().trim();
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        Boolean(c.link?.toLowerCase().includes(q)),
    );
  }, [channels, searchQuery]);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const trimmedName = newChannelName.trim();
    if (!trimmedName) {
      setCreateError("Channel name is required");
      return;
    }

    try {
      await createChannelMutation.mutateAsync({
        name: trimmedName,
        link: newChannelLink.trim() || undefined,
      });
      setNewChannelName("");
      setNewChannelLink("");
      setIsAddingChannel(false);
    } catch (err: unknown) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create channel",
      );
    }
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;
    setIsDeleting(true);
    try {
      await deleteChannelMutation.mutateAsync(channelToDelete.id);
      if (onChannelDeleted) {
        onChannelDeleted(channelToDelete.id);
      }
      setChannelToDelete(null);
    } catch (err: unknown) {
      console.error("Failed to delete channel:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.05] dark:border-white/[0.06] pb-4 sm:pb-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
            Channels
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#8C8379]">
            {channels.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAddingChannel(true);
            setCreateError(null);
          }}
          className="h-8 sm:h-9 px-3 sm:px-4 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-[#FF5338] text-white hover:bg-[#d93820] shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          title="New Channel"
          aria-label="New Channel"
        >
          <span className="text-base sm:text-xs leading-none font-bold">+</span>
          <span className="hidden sm:inline">New Channel</span>
        </button>
      </div>

      {/* Inline Create Form */}
      {isAddingChannel && (
        <form
          onSubmit={handleCreateChannel}
          className="p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-[#FCFAF7] dark:bg-[#1C1815] shadow-xs space-y-3.5 animate-in fade-in-0 slide-in-from-top-2"
        >
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] dark:border-white/[0.05]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8379]">
              Add New Channel
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAddingChannel(false);
                setCreateError(null);
              }}
              className="text-xs font-medium text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-[#FAF8F5] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {createError && (
            <div className="p-2.5 text-xs rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95] mb-1">
                Channel Name <span className="text-[#FF5338]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MrBeast, Ali Abdaal"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.025] dark:bg-white/[0.03] text-[#1E1A17] dark:text-[#FAF8F5] focus:outline-none focus:bg-white dark:focus:bg-[#201C18] focus:border-[#FF5338]/40 focus:ring-1 focus:ring-[#FF5338]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#58524C] dark:text-[#A89F95] mb-1">
                Channel URL / Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/@..."
                value={newChannelLink}
                onChange={(e) => setNewChannelLink(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.025] dark:bg-white/[0.03] text-[#1E1A17] dark:text-[#FAF8F5] focus:outline-none focus:bg-white dark:focus:bg-[#201C18] focus:border-[#FF5338]/40 focus:ring-1 focus:ring-[#FF5338]/20 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAddingChannel(false);
                setCreateError(null);
              }}
              disabled={createChannelMutation.isPending}
              className="h-8 px-3.5 rounded-full text-xs font-medium text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createChannelMutation.isPending}
              className="h-8 px-4 rounded-full text-xs font-semibold bg-[#FF5338] hover:bg-[#d93820] text-white shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {createChannelMutation.isPending ? "Creating..." : "Save Channel"}
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <svg
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8379]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.025] dark:bg-white/[0.03] text-[#1E1A17] dark:text-[#FAF8F5] placeholder-[#8C8379] focus:outline-none focus:bg-white dark:focus:bg-[#201C18] focus:border-[#FF5338]/40 focus:ring-1 focus:ring-[#FF5338]/20 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Mobile Channel Cards (sm:hidden) */}
      <div className="space-y-3 sm:hidden">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            Loading channels...
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1E1A17] space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {searchQuery
                ? "No channels match your search"
                : "No channels created yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? "Try searching for a different keyword"
                : "Add a channel to categorize your production projects"}
            </p>
          </div>
        ) : (
          filteredChannels.map((channel: ChannelRecord) => {
            const projectCount = channel._count?.projects ?? 0;
            return (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectChannel(channel.id);
                  }
                }}
                className="p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1E1A17] shadow-xs active:scale-[0.99] transition-all space-y-3 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-sm text-foreground shrink-0 border border-black/5 dark:border-white/5">
                      {channel.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {channel.name}
                      </h3>
                      {channel.link ? (
                        <a
                          href={channel.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
                        >
                          <svg
                            className="w-3 h-3 shrink-0 opacity-70"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                          <span className="truncate underline underline-offset-2">
                            {channel.link.replace(/^https?:\/\/(www\.)?/, "")}
                          </span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/40 font-mono">
                          No link attached
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/5 dark:bg-white/10 text-muted-foreground shrink-0 border border-black/5 dark:border-white/5">
                    {projectCount} {projectCount === 1 ? "project" : "projects"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-black/[0.04] dark:border-white/[0.05] text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewProjectForChannel(channel.id);
                    }}
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] text-xs font-medium text-foreground hover:text-[#FF5338] transition-colors cursor-pointer"
                  >
                    <span className="text-sm leading-none text-[#FF5338] font-bold">
                      +
                    </span>
                    <span>New Project</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChannelToDelete(channel);
                      }}
                      title={`Delete channel ${channel.name}`}
                      aria-label={`Delete channel ${channel.name}`}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>

                    <span className="text-[11px] text-[#8C8379] font-medium flex items-center gap-0.5">
                      Open <span>→</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Channels Table (hidden sm:block) */}
      <div className="hidden sm:block border border-black/[0.06] dark:border-white/[0.08] rounded-2xl overflow-hidden bg-white dark:bg-[#1E1A17] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Channel Name</th>
                <th className="py-3 px-4">Link / Handle</th>
                <th className="py-3 px-4">Projects</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-xs">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-muted-foreground"
                  >
                    Loading channels...
                  </td>
                </tr>
              ) : filteredChannels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg
                        className="w-8 h-8 text-muted-foreground/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect
                          width="20"
                          height="15"
                          x="2"
                          y="7"
                          rx="2"
                          ry="2"
                        />
                        <polyline points="17 2 12 7 7 2" />
                      </svg>
                      <p className="text-sm font-medium text-foreground">
                        {searchQuery
                          ? "No channels match your search"
                          : "No channels created yet"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchQuery
                          ? "Try searching for a different keyword"
                          : "Add a channel to categorize your production projects"}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingChannel(true)}
                          className="mt-2 text-xs h-8 px-3"
                        >
                          <svg
                            className="w-3.5 h-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                          Add First Channel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredChannels.map((channel: ChannelRecord) => {
                  const projectCount = channel._count?.projects ?? 0;
                  return (
                    <tr
                      key={channel.id}
                      tabIndex={0}
                      onClick={() => onSelectChannel(channel.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectChannel(channel.id);
                        }
                      }}
                      className="group cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors focus:outline-none focus:bg-black/[0.03] dark:focus:bg-white/[0.04]"
                    >
                      {/* Channel Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-foreground shrink-0 border border-black/5 dark:border-white/5">
                            {channel.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {channel.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Link / URL */}
                      <td className="py-3 px-4">
                        {channel.link ? (
                          <a
                            href={channel.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors group/link"
                          >
                            <svg
                              className="w-3.5 h-3.5 shrink-0 opacity-70"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            <span className="truncate max-w-[200px] underline underline-offset-2">
                              {channel.link.replace(/^https?:\/\/(www\.)?/, "")}
                            </span>
                            <svg
                              className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                              />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-muted-foreground/40 font-mono text-[11px]">
                            —
                          </span>
                        )}
                      </td>

                      {/* Project Count Pill */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/5 dark:bg-white/10 text-muted-foreground border border-black/5 dark:border-white/5">
                          {projectCount}{" "}
                          {projectCount === 1 ? "project" : "projects"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenNewProjectForChannel(channel.id);
                            }}
                            title={`Add project for ${channel.name}`}
                            aria-label={`Add project for ${channel.name}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#221E1A] hover:bg-[#F1EDE6] dark:hover:bg-[#2C2723] text-muted-foreground hover:text-[#FF5338] dark:hover:text-[#FF5338] transition-colors shadow-xs cursor-pointer"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setChannelToDelete(channel);
                            }}
                            title={`Delete channel ${channel.name}`}
                            aria-label={`Delete channel ${channel.name}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#221E1A] hover:bg-red-50 dark:hover:bg-red-950/40 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-xs cursor-pointer"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apple-style Confirmation Modal */}
      {channelToDelete && (
        <dialog
          open
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setChannelToDelete(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && !isDeleting) {
              setChannelToDelete(null);
            }
          }}
          className="fixed inset-0 z-50 m-0 h-full w-full max-w-none bg-black/35 p-4 flex items-center justify-center border-0 backdrop:bg-transparent"
        >
          <div className="bg-[#FCFAF7] dark:bg-[#1C1815] border border-black/[0.08] dark:border-white/[0.1] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#1E1A17] dark:text-[#FAF8F5]">
                  Delete Channel
                </h3>
                <p className="text-xs text-[#58524C] dark:text-[#A89F95] leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-[#1E1A17] dark:text-[#FAF8F5]">
                    {channelToDelete.name}
                  </strong>
                  ?
                </p>
              </div>
            </div>

            {(channelToDelete._count?.projects ?? 0) > 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 space-y-0.5">
                <p className="font-semibold">Active Projects Linked</p>
                <p>
                  This channel is linked to {channelToDelete._count?.projects}{" "}
                  {channelToDelete._count?.projects === 1
                    ? "project"
                    : "projects"}
                  . Deleting it will unassign those projects without deleting
                  them.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChannelToDelete(null)}
                disabled={isDeleting}
                className="h-8 px-4 rounded-full text-xs font-medium text-[#58524C] dark:text-[#A89F95] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteChannel}
                disabled={isDeleting}
                className="h-8 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                {isDeleting ? "Deleting…" : "Delete Channel"}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
