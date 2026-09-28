"use client";

import { Button } from "@/components/ui/button";
import { useChannels, useCreateChannel } from "@/hooks/use-channels";
import type { ChannelRecord } from "@/types/channel";
import { useMemo, useState } from "react";

interface ChannelsViewProps {
  onSelectChannel: (channelId: string) => void;
  onOpenNewProjectForChannel: (channelId: string) => void;
}

export function ChannelsView({
  onSelectChannel,
  onOpenNewProjectForChannel,
}: ChannelsViewProps) {
  const { data: channels = [], isLoading } = useChannels();
  const createChannelMutation = useCreateChannel();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelLink, setNewChannelLink] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E1A17] dark:text-[#FAF8F5]">
              Channels
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-black/5 dark:bg-white/10 text-muted-foreground border border-black/5 dark:border-white/5">
              {channels.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage creator channels and quickly filter associated production
            projects.
          </p>
        </div>

        <Button
          onClick={() => {
            setIsAddingChannel(true);
            setCreateError(null);
          }}
          className="h-9 px-3.5 text-xs font-medium gap-1.5 self-start sm:self-auto"
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
          New Channel
        </Button>
      </div>

      {/* Inline Create Form */}
      {isAddingChannel && (
        <form
          onSubmit={handleCreateChannel}
          className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#1f1b18]/80 backdrop-blur-md shadow-xs space-y-3 animate-in fade-in-0 slide-in-from-top-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Add New Channel
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAddingChannel(false);
                setCreateError(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          {createError && (
            <div className="p-2 text-xs rounded bg-destructive/10 text-destructive border border-destructive/20">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Channel Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MrBeast, Ali Abdaal"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Channel URL / Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/@..."
                value={newChannelLink}
                onChange={(e) => setNewChannelLink(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingChannel(false);
                setCreateError(null);
              }}
              disabled={createChannelMutation.isPending}
              className="h-8 px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createChannelMutation.isPending}
              className="h-8 px-3 text-xs"
            >
              {createChannelMutation.isPending ? "Creating..." : "Save Channel"}
            </Button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Channels Table */}
      <div className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden bg-white/40 dark:bg-[#1a1714]/40 backdrop-blur-sm shadow-xs">
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
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNewProjectForChannel(channel.id);
                          }}
                          title="New Project"
                          aria-label="New Project"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground inline-flex items-center justify-center ml-auto"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
