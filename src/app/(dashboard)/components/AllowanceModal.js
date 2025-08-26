"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

export default function AllowanceModal({ userId, isOpen, onClose, onSaved }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Swal.fire("Input Salah", "Nominal harus lebih dari 0", "warning");
      return;
    }

    setLoading(true);
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      // cek apakah sudah ada allowance bulan ini
      const { data: existing } = await supabase.from("allowances").select("*").eq("user_id", userId).eq("month", month).eq("year", year).maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from("allowances")
          .update({
            amount: parseFloat(amount),
            remaining: parseFloat(amount), // reset bulan baru
          })
          .eq("id", existing.id);
      } else {
        result = await supabase.from("allowances").insert([
          {
            user_id: userId,
            month,
            year,
            amount: parseFloat(amount),
            remaining: parseFloat(amount),
          },
        ]);
      }

      if (result.error) throw result.error;

      Swal.fire("Berhasil", "Uang saku berhasil diatur!", "success");
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving allowance:", err.message);
      Swal.fire("Error", "Gagal menyimpan uang saku", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-black font-bold mb-4">Atur Uang Saku Bulanan</h2>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-gray-300 text-black rounded-lg p-2 mb-4" placeholder="Masukkan nominal (Rp)" />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-red-600 rounded-md" onClick={onClose}>
            Batal
          </button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
