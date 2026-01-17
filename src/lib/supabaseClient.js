import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================================================
// AUTHENTICATION HELPER FUNCTIONS
// =============================================================================

/**
 * Sign up a new user with email, password, and optional profile data.
 * 
 * ABOUT USER_METADATA:
 * --------------------
 * Supabase Auth provides a `user_metadata` field on every user object.
 * This is perfect for storing simple profile information like:
 * - Full name
 * - Avatar URL
 * - Preferences
 * 
 * Benefits of user_metadata:
 * 1. No need to create a separate "profiles" table for basic data
 * 2. Data is automatically available on the user object after login
 * 3. Can be set during signUp via options.data
 * 4. Can be updated later via supabase.auth.updateUser()
 * 
 * Limitations:
 * - Limited to ~1MB per user
 * - Not suitable for complex relational data
 * - For complex profiles, use a separate "profiles" table linked via user.id
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {string} fullName - Optional. User's full name to store in user_metadata
 */
export const signUp = async (email, password, fullName = null) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // Store full_name in user_metadata
        // This will be accessible via user.user_metadata.full_name
        full_name: fullName,
      },
    },
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

// --- Allowance Helper ---
export async function deductAllowance(userId, amount) {
  // ambil allowance aktif bulan ini
  const { data: allowance, error } = await supabase
    .from("allowances")
    .select("*")
    .eq("user_id", userId)
    .eq("month", new Date().getMonth() + 1)
    .eq("year", new Date().getFullYear())
    .single();

  if (error || !allowance) {
    return { error: error || { message: "Allowance tidak ditemukan" } };
  }

  const newRemaining = allowance.remaining - amount;

  const { data, error: updateError } = await supabase.from("allowances").update({ remaining: newRemaining }).eq("id", allowance.id).select().single();

  return { data, error: updateError };
}

export async function setAllowance({ userId, amount, month, year, remaining }) {
  const now = new Date();
  const allowanceMonth = month ?? now.getMonth() + 1;
  const allowanceYear = year ?? now.getFullYear();
  const allowanceRemaining = typeof remaining === "number" ? remaining : amount;

  const payload = {
    user_id: userId,
    amount,
    remaining: allowanceRemaining,
    month: allowanceMonth,
    year: allowanceYear,
  };

  const { data, error } = await supabase
    .from("allowances")
    .upsert(payload, { onConflict: "user_id,month,year" })
    .select()
    .maybeSingle();

  return { data, error };
}
