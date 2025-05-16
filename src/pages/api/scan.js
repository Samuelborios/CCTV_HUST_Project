
import { scanNetwork } from '../../lib/scan-cam';

export const POST = async ({ request }) => {
  const body = await request.json();
  const { username, password } = body;

  const cameras = await scanNetwork({ username, password });

  return new Response(JSON.stringify({ cameras }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
