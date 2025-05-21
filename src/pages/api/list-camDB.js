import { supabase } from '../../lib/supabase';

export const GET = async () => {
  const { data, error } = await supabase.from('cameras').select('*');

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ cameras: data }), { status: 200 });
};
