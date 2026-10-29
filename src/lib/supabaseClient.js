import { supabase } from "@/lib/supabase";

export { supabase };

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

export const formatAuthErrorMessage = (error, fallbackMessage) => {
  const raw = String(error?.message || "").toLowerCase();
  if (!raw) return fallbackMessage;

  if (
    raw.includes("invalid login credentials") ||
    raw.includes("invalid_credentials")
  ) {
    return "Email atau kata sandi belum sesuai. Periksa kembali lalu coba lagi.";
  }

  if (raw.includes("email not confirmed")) {
    return "Alamat email belum dikonfirmasi. Periksa kotak masuk atau folder spam Anda.";
  }

  if (
    raw.includes("user already registered") ||
    raw.includes("already been registered")
  ) {
    return "Alamat email ini sudah terdaftar. Silakan masuk atau gunakan pemulihan kata sandi.";
  }

  if (
    raw.includes("password should be at least") ||
    raw.includes("weak_password")
  ) {
    return "Kata sandi terlalu pendek. Gunakan minimal 6 karakter.";
  }

  if (
    raw.includes("same_password") ||
    raw.includes("different from the old password")
  ) {
    return "Kata sandi baru harus berbeda dari kata sandi sebelumnya.";
  }

  if (
    raw.includes("rate limit") ||
    raw.includes("too many requests") ||
    raw.includes("for security purposes")
  ) {
    return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  }

  if (raw.includes("network") || raw.includes("failed to fetch")) {
    return "Koneksi sedang terputus. Periksa jaringan lalu coba lagi.";
  }

  return fallbackMessage;
};
