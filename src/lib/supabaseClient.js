import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions untuk auth
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Helper functions untuk expenses
export const getExpenses = async (userId) => {
  const { data, error } = await supabase.from("expenses").select("*").eq("user_id", userId).order("date", { ascending: false });

  return { data, error };
};

export const addExpense = async (expense) => {
  const { data, error } = await supabase.from("expenses").insert([expense]).select();

  return { data, error };
};

export const getExpensesSummary = async (userId, month, year) => {
  const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
  const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;

  const { data, error } = await supabase.from("expenses").select("amount, category").eq("user_id", userId).gte("date", startDate).lte("date", endDate);

  return { data, error };
};
