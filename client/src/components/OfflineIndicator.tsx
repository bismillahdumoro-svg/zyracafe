import { useOnline } from "@/hooks/use-online";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineIndicator() {
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md flex items-center gap-2 shadow-lg z-50 animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Mode Offline - Data akan disinkronkan saat online</span>
    </div>
  );
}
