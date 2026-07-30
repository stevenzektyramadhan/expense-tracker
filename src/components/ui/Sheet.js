"use client";

// Hallmark · component: Sheet · genre: modern-minimal · theme: Calm Ledger
// states: default/hover/focus/active/disabled/loading/error/success · contrast: semantic tokens
import Dialog from "@/components/ui/Dialog";

export default function Sheet(props) {
  return <Dialog {...props} size="full" variant="sheet" />;
}
