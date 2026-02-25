import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.error('Supabase environment variables are missing.');
}

const createStubClient = () => {
  const error = { message: 'Supabase is not configured.' };
  const emptyResult = { data: [], error };
  const singleResult = { data: null, error };
  const chainable = {
    eq: () => chainable,
    order: () => chainable,
    limit: () => chainable,
    select: () => emptyResult,
    insert: () => ({ ...singleResult, select: () => ({ single: () => singleResult }) }),
    update: () => ({ ...singleResult, eq: () => ({ select: () => ({ single: () => singleResult }) }) }),
    delete: () => ({ ...singleResult, eq: () => singleResult }),
    single: () => singleResult,
    maybeSingle: () => singleResult
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error }),
      getUser: async () => ({ data: { user: null }, error }),
      signInWithPassword: async () => ({ data: null, error }),
      signUp: async () => ({ data: null, error }),
      signInWithOAuth: async () => ({ data: null, error }),
      signOut: async () => ({ error }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    functions: {
      invoke: async () => ({ data: null, error })
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error }),
        getPublicUrl: () => ({ data: { publicUrl: null } })
      })
    },
    from: () => chainable
  };
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : createStubClient();
