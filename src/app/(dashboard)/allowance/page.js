"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { setAllowance } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

export default function AllowancePage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");

  const handleSave = async () => {
    const { error } = await setAllowance(user.id, parseFloat(amount));
    if (error) {
      Swal.fire("Error", "Gagal menyimpan uang saku", "error");
    } else {
      Swal.fire("Berhasil", "Uang saku berhasil disimpan", "success");
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
