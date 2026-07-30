"use client";
import { useEffect, useState } from "react";

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return undefined;

    let disposed = false;
    let registration;
    let installingWorker;
    let reloadRequested = false;

    const handleControllerChange = () => {
      if (reloadRequested) return;
      reloadRequested = true;
      window.location.reload(); // reload otomatis kalau SW baru aktif
    };

    const handleWorkerStateChange = () => {
      if (
        !disposed &&
        installingWorker?.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        setUpdateAvailable(true); // trigger UI untuk update
      }
    };

    const handleUpdateFound = () => {
      installingWorker?.removeEventListener(
        "statechange",
        handleWorkerStateChange,
      );
      installingWorker = registration?.installing;
      installingWorker?.addEventListener(
        "statechange",
        handleWorkerStateChange,
      );
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    navigator.serviceWorker.ready.then((resolvedRegistration) => {
      if (disposed) return;
      registration = resolvedRegistration;
      registration.addEventListener("updatefound", handleUpdateFound);
    });

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
      registration?.removeEventListener("updatefound", handleUpdateFound);
      installingWorker?.removeEventListener(
        "statechange",
        handleWorkerStateChange,
      );
    };
  }, []);

  return updateAvailable;
}
