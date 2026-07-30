"use client";

// Hallmark · component: Dialog · genre: modern-minimal · theme: Calm Ledger
// states: default/hover/focus/active/disabled/loading/error/success · contrast: semantic tokens
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

import Button from "@/components/ui/Button";
import StatusBanner from "@/components/ui/StatusBanner";

const BODY_FOCUS_TARGETS = [
  "[autofocus]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "a[href]",
].join(",");

const FALLBACK_FOCUS_TARGETS = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
].join(",");

export default function Dialog({
  bodyClassName = "",
  children,
  className = "",
  closeLabel = "Tutup dialog",
  description,
  footer,
  initialFocusRef,
  onClose,
  open = true,
  preventClose = false,
  showClose = true,
  size = "md",
  surfaceClassName = "",
  title,
  variant = "dialog",
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const pointerStartedOnBackdropRef = useRef(false);
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return undefined;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (!dialog.open) dialog.showModal();

    const focusFrame = window.requestAnimationFrame(() => {
      const requestedTarget = initialFocusRef?.current;
      const bodyTarget = dialog
        .querySelector(".ui-dialog__body")
        ?.querySelector(BODY_FOCUS_TARGETS);
      const fallbackTarget = dialog.querySelector(FALLBACK_FOCUS_TARGETS);
      const target =
        requestedTarget instanceof HTMLElement
          ? requestedTarget
          : bodyTarget || fallbackTarget;

      target?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      if (dialog.open) dialog.close();

      const previousFocus = previousFocusRef.current;
      window.requestAnimationFrame(() => {
        if (previousFocus?.isConnected) previousFocus.focus();
      });
    };
  }, [initialFocusRef, open]);

  if (!open) return null;

  const requestClose = () => {
    if (!preventClose) onClose?.();
  };
  const dialogClasses = ["ui-dialog", className].filter(Boolean).join(" ");
  const surfaceClasses = ["ui-dialog__surface", surfaceClassName]
    .filter(Boolean)
    .join(" ");
  const bodyClasses = ["ui-dialog__body", bodyClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <dialog
      ref={dialogRef}
      className={dialogClasses}
      data-size={size}
      data-variant={variant}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={preventClose || undefined}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onPointerDown={(event) => {
        pointerStartedOnBackdropRef.current =
          event.target === event.currentTarget;
      }}
      onClick={(event) => {
        const endedOnBackdrop = event.target === event.currentTarget;
        if (pointerStartedOnBackdropRef.current && endedOnBackdrop) {
          requestClose();
        }
        pointerStartedOnBackdropRef.current = false;
      }}
    >
      <section
        className={surfaceClasses}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ui-dialog__header">
          <div className="ui-dialog__heading">
            <h2 id={titleId} className="ui-dialog__title">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="ui-dialog__description">
                {description}
              </p>
            ) : null}
          </div>
          {showClose ? (
            <Button
              type="button"
              size="icon"
              variant="quiet"
              onClick={requestClose}
              disabled={preventClose}
              aria-label={closeLabel}
            >
              <X aria-hidden="true" />
            </Button>
          ) : null}
        </header>

        <div className={bodyClasses}>{children}</div>

        {footer ? <footer className="ui-dialog__footer">{footer}</footer> : null}
      </section>
    </dialog>
  );
}

export function ConfirmDialog({
  cancelLabel = "Batal",
  confirmLabel,
  description,
  error,
  isLoading = false,
  loadingLabel = "Memproses…",
  onClose,
  onConfirm,
  open = true,
  title,
  variant = "destructive",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      preventClose={isLoading}
      size="sm"
      title={title}
      description={description}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
            loadingLabel={loadingLabel}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {error ? (
        <StatusBanner tone="error" title="Tindakan belum selesai">
          {error}
        </StatusBanner>
      ) : (
        <p className="ui-dialog__confirmation-note">
          Periksa kembali sebelum melanjutkan.
        </p>
      )}
    </Dialog>
  );
}
