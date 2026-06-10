import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeedbackItem {
  id: string;
  userId: string | null;
  message: string;
  category?: string | null;
  createdAt: string;
}

export const useFeedback = () => {
  const [items, setItems] = useState<FeedbackItem[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('feedback')
      .select('id,user_id,message,category,created_at')
      .order('created_at', { ascending: false });
    setItems((data ?? []).map(r => ({
      id: r.id, userId: r.user_id, message: r.message,
      category: r.category, createdAt: r.created_at,
    })));
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = useCallback(async (entry: { userId: string | null; message: string; category?: string }) => {
    const { error } = await supabase.from('feedback').insert({
      user_id: entry.userId, message: entry.message, category: entry.category ?? null,
    });
    if (error) throw error;
    await load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await supabase.from('feedback').delete().eq('id', id);
    await load();
  }, [load]);

  return { items, submit, remove, reload: load };
};