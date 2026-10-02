"use client";

import {
  useAssetsByProject,
  useCreateAsset,
  useDeleteAsset,
  useUpdateAsset,
} from "@/hooks/use-assets";
import type { AssetSource, AssetType } from "@/types";
import { useState } from "react";
import { AssetModal } from "./asset-modal";

interface AssetsViewProps {
  projectId: string;
  projectName?: string;
  projects: Array<{ id: string; name: string }>;
}

interface NewRowState {
  type: AssetType;
  source: AssetSource;
  url: string;
  licenseText: string;
  note: string;
}

export function AssetsView({
  projectId,
  projectName,
  projects,
}: AssetsViewProps) {
  const { data: assets = [], isLoading } = useAssetsByProject(projectId);
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRow, setNewRow] = useState<NewRowState>({
    type: "VIDEO",
    source: "OTHER",
    url: "",
    licenseText: "",
    note: "",
  });
  const [rowError, setRowError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NewRowState>>({});

  const handleStartAddRow = () => {
    setIsAddingRow(true);
    setRowError(null);
    setNewRow({
      type: "VIDEO",
      source: "PEXELS",
      url: "",
      licenseText: "Free CC0",
      note: "",
    });
  };

  const handleSaveNewRow = async () => {
    if (!newRow.url.trim()) {
      setRowError("URL is required to save row");
      return;
    }

    try {
      new URL(newRow.url);
    } catch {
      setRowError("Please enter a valid URL (including https://)");
      return;
    }

    setRowError(null);
    try {
      await createAssetMutation.mutateAsync({
        url: newRow.url.trim(),
        type: newRow.type,
        source: newRow.source,
        licenseText: newRow.licenseText.trim() || undefined,
        note: newRow.note.trim() || undefined,
        projects: [{ projectId }],
      });
      setIsAddingRow(false);
      setNewRow({
        type: "VIDEO",
        source: "OTHER",
        url: "",
        licenseText: "",
        note: "",
      });
    } catch (err: unknown) {
      setRowError(err instanceof Error ? err.message : "Failed to add asset");
    }
  };

  const handleStartEdit = (asset: (typeof assets)[0]) => {
    setEditingId(asset.id);
    setEditForm({
      type: asset.type as AssetType,
      source: (asset.source as AssetSource) || "OTHER",
      url: asset.url,
      licenseText: asset.licenseText || "",
      note: asset.note || "",
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateAssetMutation.mutateAsync({
        id,
        data: {
          url: editForm.url?.trim(),
          type: editForm.type,
          source: editForm.source,
          licenseText: editForm.licenseText?.trim() || null,
          note: editForm.note?.trim() || null,
        },
      });
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update asset:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this asset row from the project spreadsheet?")) {
      await deleteAssetMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-[#8C8379]">
        Loading spreadsheet rows...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Spreadsheet Header Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-[#FAF8F5] dark:bg-[#1E1A17] p-3 sm:p-3.5 rounded-2xl border border-[#E3DCD3] dark:border-[#3C3530]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-extrabold text-[#1E1A17] dark:text-[#FAF8F5]">
            Assets Sheet
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E3DCD3]/60 dark:bg-[#2A2521] text-[#58524C] dark:text-[#A89F95]">
            {assets.length}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleStartAddRow}
            disabled={isAddingRow}
            className="h-8 px-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className="text-sm leading-none font-black">+</span>
            <span>Add Row</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-8 px-3 rounded-lg border border-[#E3DCD3] dark:border-[#3C3530] bg-white dark:bg-[#2A2521] hover:bg-[#F1EDE6] text-xs font-bold text-[#1E1A17] dark:text-white transition-colors cursor-pointer"
          >
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {rowError && (
        <div className="p-2.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
          ⚠️ {rowError}
        </div>
      )}

      {/* Excel Sheet Table Wrapper */}
      <div className="border border-[#E3DCD3] dark:border-[#3C3530] rounded-xl overflow-hidden shadow-xs bg-white dark:bg-[#1E1A17]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Sheet Column Headers */}
            <thead>
              <tr className="bg-[#F1EDE6] dark:bg-[#27221E] text-[#58524C] dark:text-[#A89F95] font-mono text-[11px] border-b border-[#E3DCD3] dark:border-[#3C3530] uppercase tracking-wider select-none">
                <th className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] w-12 text-center font-bold">
                  #
                </th>
                <th className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] w-28 font-bold">
                  Type
                </th>
                <th className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] w-28 font-bold">
                  Source
                </th>
                <th className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] min-w-[280px] font-bold">
                  Resource URL / CDN Link
                </th>
                <th className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] w-36 font-bold">
                  License
                </th>
                <th className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] min-w-[200px] font-bold">
                  Production Context / Notes
                </th>
                <th className="py-2.5 px-3 w-20 text-center font-bold">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Sheet Rows */}
            <tbody className="divide-y divide-[#E3DCD3] dark:divide-[#3C3530]">
              {assets.map((asset, index) => {
                const isEditing = editingId === asset.id;

                if (isEditing) {
                  return (
                    <tr
                      key={asset.id}
                      className="bg-[#FFEBE7]/30 dark:bg-red-950/20"
                    >
                      <td className="py-2 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] text-center font-mono text-[#8C8379]">
                        {index + 1}
                      </td>
                      <td className="py-1.5 px-2 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                        <select
                          value={editForm.type}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              type: e.target.value as AssetType,
                            })
                          }
                          className="w-full text-xs font-bold rounded p-1 bg-white dark:bg-[#2A2521] border border-[#E3DCD3] dark:border-[#3C3530]"
                        >
                          <option value="VIDEO">🎬 Video</option>
                          <option value="AUDIO">🎵 Audio</option>
                          <option value="IMAGE">🖼️ Image</option>
                          <option value="FONT">🔤 Font</option>
                          <option value="OTHER">📎 Other</option>
                        </select>
                      </td>
                      <td className="py-1.5 px-2 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                        <select
                          value={editForm.source}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              source: e.target.value as AssetSource,
                            })
                          }
                          className="w-full text-xs font-bold rounded p-1 bg-white dark:bg-[#2A2521] border border-[#E3DCD3] dark:border-[#3C3530]"
                        >
                          <option value="PEXELS">Pexels</option>
                          <option value="PIXABAY">Pixabay</option>
                          <option value="MIXKIT">Mixkit</option>
                          <option value="YOUTUBE">YouTube</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </td>
                      <td className="py-1.5 px-2 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                        <input
                          type="url"
                          value={editForm.url || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, url: e.target.value })
                          }
                          className="w-full text-xs font-mono p-1 rounded bg-white dark:bg-[#2A2521] border border-[#E3DCD3] dark:border-[#3C3530]"
                        />
                      </td>
                      <td className="py-1.5 px-2 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                        <input
                          type="text"
                          value={editForm.licenseText || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              licenseText: e.target.value,
                            })
                          }
                          className="w-full text-xs p-1 rounded bg-white dark:bg-[#2A2521] border border-[#E3DCD3] dark:border-[#3C3530]"
                        />
                      </td>
                      <td className="py-1.5 px-2 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                        <input
                          type="text"
                          value={editForm.note || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, note: e.target.value })
                          }
                          className="w-full text-xs p-1 rounded bg-white dark:bg-[#2A2521] border border-[#E3DCD3] dark:border-[#3C3530]"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(asset.id)}
                            className="p-1 rounded bg-[#059669] text-white hover:bg-[#047857]"
                            title="Save changes"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded bg-[#8C8379] text-white hover:bg-[#58524C]"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={asset.id}
                    onDoubleClick={() => handleStartEdit(asset)}
                    className="hover:bg-[#FAF8F5] dark:hover:bg-[#25201C] transition-colors group"
                  >
                    {/* Row Index */}
                    <td className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] text-center font-mono text-[#8C8379] font-semibold">
                      {index + 1}
                    </td>

                    {/* Type Badge */}
                    <td className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-xs text-[#1E1A17] dark:text-[#FAF8F5]">
                        {asset.type === "VIDEO" && "🎬 Video"}
                        {asset.type === "AUDIO" && "🎵 Audio"}
                        {asset.type === "IMAGE" && "🖼️ Image"}
                        {asset.type === "FONT" && "🔤 Font"}
                        {asset.type === "OTHER" && "📎 Asset"}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-[#F1EDE6] dark:bg-[#2A2521] text-[#58524C] dark:text-[#A89F95]">
                        {asset.source || "OTHER"}
                      </span>
                    </td>

                    {/* URL Link */}
                    <td className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                      <div className="flex items-center justify-between gap-2 max-w-md">
                        <span className="font-mono text-[11px] text-[#58524C] dark:text-[#A89F95] truncate">
                          {asset.url}
                        </span>
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#FF5338] hover:underline font-bold text-[11px] shrink-0"
                          title="Open Resource in new tab"
                        >
                          Open ↗
                        </a>
                      </div>
                    </td>

                    {/* License */}
                    <td className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] text-xs text-[#58524C] dark:text-[#A89F95] truncate">
                      {asset.licenseText || "—"}
                    </td>

                    {/* Context / Notes */}
                    <td className="py-2.5 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] text-xs text-[#1E1A17] dark:text-[#FAF8F5]">
                      {asset.note || (
                        <span className="text-[#8C8379] italic">No notes</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(asset)}
                          className="p-1 rounded text-[#8C8379] hover:text-[#1E1A17] dark:hover:text-white transition-colors"
                          title="Edit Row"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(asset.id)}
                          className="p-1 rounded text-[#8C8379] hover:text-red-500 transition-colors"
                          title="Delete Row"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Active "+ Add Row" Editable Bottom Row */}
              {isAddingRow && (
                <tr className="bg-[#D1FAE5]/30 dark:bg-emerald-950/20 border-t-2 border-[#059669]">
                  <td className="py-2 px-3 border-r border-[#E3DCD3] dark:border-[#3C3530] text-center font-mono font-bold text-[#059669]">
                    #{assets.length + 1}
                  </td>
                  <td className="py-1.5 px-2 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                    <select
                      value={newRow.type}
                      onChange={(e) =>
                        setNewRow({
                          ...newRow,
                          type: e.target.value as AssetType,
                        })
                      }
                      className="w-full text-xs font-bold rounded p-1 bg-white dark:bg-[#2A2521] border border-[#059669]"
                    >
                      <option value="VIDEO">🎬 Video</option>
                      <option value="AUDIO">🎵 Audio</option>
                      <option value="IMAGE">🖼️ Image</option>
                      <option value="FONT">🔤 Font</option>
                      <option value="OTHER">📎 Other</option>
                    </select>
                  </td>
                  <td className="py-1.5 px-2 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                    <select
                      value={newRow.source}
                      onChange={(e) =>
                        setNewRow({
                          ...newRow,
                          source: e.target.value as AssetSource,
                        })
                      }
                      className="w-full text-xs font-bold rounded p-1 bg-white dark:bg-[#2A2521] border border-[#059669]"
                    >
                      <option value="PEXELS">Pexels</option>
                      <option value="PIXABAY">Pixabay</option>
                      <option value="MIXKIT">Mixkit</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </td>
                  <td className="py-1.5 px-2 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                    <input
                      type="url"
                      placeholder="https://... (Enter URL)"
                      value={newRow.url}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveNewRow();
                        if (e.key === "Escape") setIsAddingRow(false);
                      }}
                      onChange={(e) =>
                        setNewRow({ ...newRow, url: e.target.value })
                      }
                      className="w-full text-xs font-mono p-1 rounded bg-white dark:bg-[#2A2521] border border-[#059669] focus:outline-none"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                    <input
                      type="text"
                      placeholder="License / Rights"
                      value={newRow.licenseText}
                      onChange={(e) =>
                        setNewRow({ ...newRow, licenseText: e.target.value })
                      }
                      className="w-full text-xs p-1 rounded bg-white dark:bg-[#2A2521] border border-[#059669]"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-[#E3DCD3] dark:border-[#3C3530]">
                    <input
                      type="text"
                      placeholder="Production note or scene timestamp"
                      value={newRow.note}
                      onChange={(e) =>
                        setNewRow({ ...newRow, note: e.target.value })
                      }
                      className="w-full text-xs p-1 rounded bg-white dark:bg-[#2A2521] border border-[#059669]"
                    />
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={handleSaveNewRow}
                        className="px-2 py-1 rounded bg-[#059669] text-white hover:bg-[#047857] font-bold text-xs"
                        title="Save Row (Enter)"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingRow(false)}
                        className="px-2 py-1 rounded bg-[#8C8379] text-white hover:bg-[#58524C] font-bold text-xs"
                        title="Cancel (Esc)"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom "+ Add Row" Button (Spreadsheet Footer) */}
        {!isAddingRow && (
          <div className="p-2.5 bg-[#FAF8F5] dark:bg-[#221D19] border-t border-[#E3DCD3] dark:border-[#3C3530] flex items-center justify-between">
            <button
              type="button"
              onClick={handleStartAddRow}
              className="text-xs font-bold text-[#059669] hover:text-[#047857] flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-[#059669]/10 transition-colors cursor-pointer"
            >
              <span className="text-base leading-none font-black">+</span>
              <span>Add another row</span>
            </button>

            <span className="text-[11px] font-mono text-[#8C8379]">
              Excel Format • Double-click row to edit
            </span>
          </div>
        )}
      </div>

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projects={projects}
        defaultProjectId={projectId}
      />
    </div>
  );
}
