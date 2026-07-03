import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, restore any persisted session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchAndMergeProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchAndMergeProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAndMergeProfile = async (authUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      setUser({
        ...authUser,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
        avatar_url: profile?.avatar_url || '',
        role: profile?.role || 'user',
      });
    } catch {
      // If profiles table doesn't exist yet, still set the auth user
      setUser({
        ...authUser,
        full_name: authUser.user_metadata?.full_name || '',
        role: 'user',
      });
    } finally {
      setLoading(false);
    }
  };

  // Derived token from session for backward-compat with existing pages
  const token = session?.access_token || null;

  const signup = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) return { success: false, error: error.message };

    // If email confirmation is required, session will be null
    if (!data.session) {
      return { success: true, emailVerificationRequired: true };
    }

    return { success: true };
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { success: false, error: 'Please verify your email before logging in.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const forgotPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Update auth metadata (full_name)
    const metaUpdate = {};
    if (updates.full_name) metaUpdate.data = { full_name: updates.full_name };
    if (updates.full_name || updates.email) {
      await supabase.auth.updateUser(metaUpdate);
    }

    // Upsert into profiles table
    const profilePayload = { id: user.id, updated_at: new Date().toISOString() };
    if (updates.full_name) profilePayload.full_name = updates.full_name;
    if (updates.avatar_url !== undefined) profilePayload.avatar_url = updates.avatar_url;

    const { error } = await supabase.from('profiles').upsert(profilePayload);
    if (error) return { success: false, error: error.message };

    setUser((prev) => ({ ...prev, ...updates }));
    return { success: true };
  };

  const deleteAccount = async () => {
    // This requires the user to be authenticated. We can only do a soft-delete
    // on the profile row — actual user deletion needs a Supabase Edge Function or admin key.
    // For frontend-only, we sign out and mark account as deleted in profile.
    if (!user) return { success: false, error: 'Not authenticated' };
    await supabase.from('profiles').update({ deleted: true }).eq('id', user.id);
    await supabase.auth.signOut();
    return { success: true };
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      session,
      loading,
      isAdmin,
      login,
      signup,
      logout,
      forgotPassword,
      updatePassword,
      updateProfile,
      deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
