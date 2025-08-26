import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { user_id, amount } = await req.json();

    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // cek allowance bulan ini
    const { data: existing, error: checkError } = await supabase.from("allowances").select("*").eq("user_id", user_id).eq("month", month).eq("year", year).single();

    if (checkError && checkError.code !== "PGRST116") {
      return new Response(JSON.stringify({ error: checkError.message }), { status: 400 });
    }

    // kalau sudah ada → return
    if (existing) {
      return new Response(JSON.stringify(existing), { status: 200 });
    }

    // kalau belum ada → insert baru
    const { data, error } = await supabase
      .from("allowances")
      .insert([{ user_id, month, year, amount, remaining: amount }])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
