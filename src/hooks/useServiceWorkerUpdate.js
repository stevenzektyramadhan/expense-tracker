"use client";
import { useEffect, useRef, useState } from "react";

export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registrationRef = useRef(null);
  const userAcceptedUpdateRef = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return undefined;

    let disposed = false;
    let registration;
    let installingWorker;
    let reloadRequested = false;

    const handleControllerChange = () => {
      if (!userAcceptedUpdateRef.current || reloadRequested) return;
      reloadRequested = true;
      window.location.reload();
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
      registrationRef.current = registration;
      if (registration.waiting) setUpdateAvailable(true);
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

  const reloadApp = () => {
    userAcceptedUpdateRef.current = true;
    const waitingWorker = registrationRef.current?.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      return;
    }
    window.location.reload();
  };

  return { reloadApp, updateAvailable };
}
