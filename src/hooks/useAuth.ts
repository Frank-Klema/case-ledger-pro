import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { SafeUser, setCachedUserId } from '@/lib/auth';

const PASSWORD_MIN = 8;

const validatePassword = (password: string): string => {
  if (!password) return 'Password is required';
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  return '';
};

const buildSafeUser = async (userId: string, email: string | null): Promise<SafeUser> => {
  const [{ data: profile }, { data: role }] = await Promise.all([
    supabase.from('profiles').select('display_name,avatar_url,created_at').eq('id', userId).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle(),
  ]);
  return {
    id: userId,
    email: email ?? '',
    displayName: profile?.display_name || (email?.split('@')[0] ?? ''),
    avatar: profile?.avatar_url || undefined,
    isAdmin: !!role,
    createdAt: profile?.created_at || new Date().toISOString(),
  };
};

export const useAuth = () => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (!u) {
        setCachedUserId(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setCachedUserId(u.id);
      // Defer DB reads — never block the auth callback.
      setTimeout(() => {
        buildSafeUser(u.id, u.email ?? null).then(setUser).finally(() => setLoading(false));
      }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (!u) { setLoading(false); return; }
      setCachedUserId(u.id);
      buildSafeUser(u.id, u.email ?? null).then(setUser).finally(() => setLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const e = email.trim().toLowerCase();
    const err = validatePassword(password);
    if (err) throw new Error(err);
    const { error } = await supabase.auth.signUp({
      email: e,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName.trim() || e.split('@')[0] },
      },
    });
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const res = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}/`,
    });
    if ((res as any).error) throw (res as any).error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCachedUserId(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: { displayName?: string; avatar?: string }) => {
    if (!user) return;
    const payload: Record<string, unknown> = {};
    if (updates.displayName !== undefined) payload.display_name = updates.displayName;
    if (updates.avatar !== undefined) payload.avatar_url = updates.avatar;
    const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
    if (error) throw error;
    setUser({ ...user, displayName: updates.displayName ?? user.displayName, avatar: updates.avatar ?? user.avatar });
  }, [user]);

  return { user, loading, signUp, signIn, signInWithGoogle, signOut, updateProfile, validatePassword };
};
