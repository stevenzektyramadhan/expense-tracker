"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import Swal from "sweetalert2";

export default function AllowancePage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");

  const handleSave = async () => {
    if (!user) return;

    const parsedAmount = parseFloat(amount);

    try {
      const response = await authenticatedFetch("/api/allowances", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parsedAmount,
          frequency: "monthly",
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Gagal menyimpan uang saku");
      }

      Swal.fire("Berhasil", "Uang saku berhasil disimpan", "success");
    } catch (error) {
      Swal.fire("Error", error.message || "Gagal menyimpan uang saku", "error");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Atur Uang Saku Bulanan</h1>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Masukkan nominal (Rp)" />
      <button onClick={handleSave} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg">
        Simpan
      </button>
    </div>
  );
}
