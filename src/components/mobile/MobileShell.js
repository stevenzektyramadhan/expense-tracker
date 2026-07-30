"use client";

/**
 * @deprecated Phase 9: imported only by deprecated mobile page trees.
 * AppShell now owns authenticated navigation, spacing, status, and safe areas.
 * Retained until cleanup is explicitly approved. Do not add new imports.
 */
// =============================================================================
// MOBILE SHELL - Temporary Phase 2 compatibility wrapper
// =============================================================================
// AppShell now owns the authenticated header, navigation, logout, content
// reservation, and safe areas. This wrapper intentionally preserves the dark
// visual context expected by legacy mobile pages until each page is replaced
// and verified in a later phase.
// =============================================================================

export default function MobileShell({ children }) {
  return (
    <div
      className="min-h-full bg-gray-900 text-white"
      data-mobile-shell-compatibility="phase-2"
    >
      {children}
    </div>
  );
}
