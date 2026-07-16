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
