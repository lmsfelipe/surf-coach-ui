import { useSyncExternalStore } from 'react';
import { CloudOff } from 'lucide-react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

/** Sticky top banner shown while the browser reports no connection. */
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, getSnapshot, () => true);
  if (online) return null;
  return (
    <div className="sticky top-0 z-40 flex items-center gap-2 border-b border-warning/20 bg-warning/[0.14] px-5 py-2">
      <CloudOff className="size-[15px] text-warning" />
      <span className="text-xs font-semibold text-warning">Sem conexão.</span>
    </div>
  );
}
