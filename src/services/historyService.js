import { supabase } from '../supabase';

export async function getScanHistory(userId) {
  const { data, error } = await supabase
    .from('scan_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('scan_history select failed', { userId, error });
    throw new Error(error.message || error.details || 'Failed to load scan history');
  }

  return data ?? [];
}

export async function deleteScan(id, userId) {
  const { error } = await supabase
    .from('scan_history')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('scan_history delete failed', { id, userId, error });
    throw new Error(error.message || error.details || 'Failed to delete scan');
  }

  return true;
}
