"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import StatusBanner from "@/components/ui/StatusBanner";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setMounted(true);
    setPortalTarget(document.getElementById("app-status-region"));
  }, []);

  if (!mounted || isOnline) return null;

  const banner = (
    <div className="pointer-events-auto w-full shadow-[var(--elevation-2)]">
      <StatusBanner tone="offline" title="Anda sedang offline">
        Koneksi terputus. Data yang ditampilkan mungkin data tersimpan dan transaksi baru belum dapat disimpan.
      </StatusBanner>
    </div>
  );

  if (portalTarget) return createPortal(banner, portalTarget);

  return (
    <div
      className="pointer-events-none fixed inset-x-4 z-[var(--z-toast)] mx-auto max-w-lg md:inset-x-auto md:right-6 md:mx-0 md:w-[min(28rem,calc(100vw-3rem))]"
      style={{
        bottom: "max(var(--space-md), env(safe-area-inset-bottom, 0px))",
      }}
    >
      {banner}
    </div>
  );
}
