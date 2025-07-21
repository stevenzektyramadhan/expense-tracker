"use client";

export default function ImageZoomModal({ imageUrl, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <img src={imageUrl} alt="Zoomed" className="max-h-[90%] max-w-[90%] object-contain" />
      <button className="absolute top-4 right-4 text-white text-2xl" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
