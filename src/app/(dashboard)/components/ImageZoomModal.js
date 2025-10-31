"use client";

import Image from "next/image";

export default function ImageZoomModal({ imageUrl, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative h-[80vh] w-[90vw] max-w-4xl">
        <Image
          src={imageUrl}
          alt="Zoomed receipt"
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>
      <button className="absolute top-4 right-4 text-2xl text-white" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
