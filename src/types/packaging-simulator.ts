export type SimulationDevice = "desktop" | "mobile";
export type SimulationTheme = "dark" | "light";

export interface SimulatorReferenceItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelName?: string | null;
  views?: string | null;
  duration?: string | null;
}

export interface PackagingSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  channelName?: string | null;
  channelAvatarUrl?: string | null;
  thumbnails: Array<{
    id: string;
    url: string;
    isMain: boolean;
    label?: string | null;
  }>;
  referenceInspirations?: SimulatorReferenceItem[];
}
