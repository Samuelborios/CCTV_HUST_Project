import { supabase } from "../../lib/supabase";
import { scanNetwork } from '../../lib/scan-cam';

export const POST = async ({ request }) => {
  const body = await request.json();
  const { username, password } = body;

  // 🍪 Parse cookies from request
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, ...rest] = cookie.split('=');
      return [name, decodeURIComponent(rest.join('='))];
    })
  );

  // 🔐 Récupère les tokens depuis les cookies
  const access_token = cookies['sb-access-token'];
  const refresh_token = cookies['sb-refresh-token'];

  if (!access_token || !refresh_token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
  }

  const cameras = await scanNetwork({ username, password, supabase });

  return new Response(JSON.stringify({ cameras }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
