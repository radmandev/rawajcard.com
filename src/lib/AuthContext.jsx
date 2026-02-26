import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

// @ts-ignore
const profileTable = import.meta.env.VITE_SUPABASE_PROFILE_TABLE || 'profiles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkUserAuth(true); // initial load — show spinner

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      // Only re-check on meaningful auth changes — NOT on every tab focus/token refresh
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        checkUserAuth(false); // silent re-check — no loading spinner
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);


  const checkUserAuth = async (isInitialLoad = false) => {
    try {
      // Only show loading spinner on the very first load, not on subsequent re-checks
      if (isInitialLoad) setIsLoadingAuth(true);
      setAuthError(null);

      if (!isSupabaseConfigured) {
        setAuthError({
          type: 'config',
          message: 'Supabase is not configured.'
        });
        setIsLoadingAuth(false);
        setIsLoadingPublicSettings(false);
        return;
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!sessionData?.session) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setIsLoadingPublicSettings(false);
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const authUser = userData?.user || null;

      if (authUser) {
        const displayName = authUser.user_metadata?.full_name
          || authUser.user_metadata?.name
          || authUser.user_metadata?.preferred_username
          || authUser.email?.split('@')[0];

        try {
          await supabase.from(profileTable).upsert({
            id: authUser.id,
            email: authUser.email,
            full_name: displayName
          }, { onConflict: 'id', ignoreDuplicates: false });
        } catch (profileError) {
          console.error('Profile upsert failed:', profileError);
        }
      }

      setUser({
        ...authUser,
        full_name: authUser.user_metadata?.full_name
          || authUser.user_metadata?.name
          || authUser.user_metadata?.preferred_username
          || authUser.email?.split('@')[0]
      });
      setIsAuthenticated(Boolean(authUser));
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      
      setAuthError({
        type: 'auth_required',
        message: 'Authentication required'
      });
      setIsLoadingPublicSettings(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      supabase.auth.signOut().finally(() => {
        window.location.href = '/login';
      });
    } else {
      supabase.auth.signOut();
    }
  };

  const navigateToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState: checkUserAuth,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
