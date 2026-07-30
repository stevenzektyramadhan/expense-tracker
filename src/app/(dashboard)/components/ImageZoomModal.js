"use client";

import Image from "next/image";

import Dialog from "@/components/ui/Dialog";

export default function ImageZoomModal({ imageUrl, onClose }) {
  return (
    <Dialog
      open
      onClose={onClose}
      size="xl"
      title="Pratinjau struk"
      description="Gambar diperbesar tanpa mengubah data transaksi."
      bodyClassName="p-3 sm:p-4"
    >
      <div className="receipt-viewer">
        <div className="relative h-[min(72dvh,48rem)] w-full">
          <Image
            src={imageUrl}
            alt="Struk pengeluaran yang diperbesar"
            fill
            sizes="(max-width: 1024px) 96vw, 1024px"
            className="object-contain"
            priority
          />
        </div>
      </div>
    </Dialog>
  );
}
