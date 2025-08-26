import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { user_id, amount, description, category, date } = await req.json();

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // ambil allowance bulan aktif
    const { data: allowance, error: allowanceError } = await supabase.from("allowances").select("*").eq("user_id", user_id).eq("month", month).eq("year", year).single();

    if (allowanceError) throw allowanceError;

    if (!allowance) {
      return new Response(JSON.stringify({ error: "Allowance bulan ini belum dibuat" }), { status: 400 });
    }

    // insert expense dengan allowance_id
    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          user_id,
          amount,
          description,
          category,
          date,
          allowance_id: allowance.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
