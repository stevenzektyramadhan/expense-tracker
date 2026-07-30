"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import StatusBanner from "@/components/ui/StatusBanner";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

export default function UpdatePrompt() {
  const updateAvailable = useServiceWorkerUpdate();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setMounted(true);
    setPortalTarget(document.getElementById("app-status-region"));
  }, [pathname]);

  if (!mounted || !updateAvailable) return null;

  const prompt = (
    <div className="pointer-events-auto w-full shadow-[var(--elevation-2)]">
      <StatusBanner
        tone="warning"
        title="Versi baru kiteCatat tersedia"
        action={
          <Button
            variant="secondary"
            size="compact"
            onClick={() => window.location.reload()}
          >
            Perbarui sekarang
          </Button>
        }
      >
        Muat ulang untuk menggunakan versi terbaru.
      </StatusBanner>
    </div>
  );

  if (portalTarget) return createPortal(prompt, portalTarget);

  // Auth and other public routes have no AppShell status target. Keep a
  // hydration-safe fixed fallback without reading document during render.
  return (
    <div
      className="pointer-events-none fixed inset-x-4 z-[var(--z-toast)] mx-auto max-w-lg md:inset-x-auto md:right-6 md:mx-0 md:w-[min(28rem,calc(100vw-3rem))]"
      style={{ bottom: "max(var(--space-md), env(safe-area-inset-bottom, 0px))" }}
    >
      {prompt}
    </div>
  );
}
