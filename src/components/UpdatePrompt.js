"use client";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

export default function UpdatePrompt() {
  const updateAvailable = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-200 p-3 rounded shadow-lg text-black z-50">
      Ada versi baru!{" "}
      <button className="ml-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => window.location.reload()}>
        Refresh
      </button>
    </div>
  );
}
