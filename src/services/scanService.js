import { supabase } from '../supabase';

export async function saveScan(scanPayload) {
  const { data, error } = await supabase
    .from('scan_history')
    .insert(scanPayload)
    .select()
    .single();

  if (error) {
    console.error('scan_history insert failed', { scanPayload, error });
    throw new Error(error.message || error.details || 'Failed to save scan');
  }

  return data;
}
