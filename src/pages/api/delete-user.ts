import type { APIRoute } from 'astro';
import { digestFetchDahua } from '../../lib/dahua-fetch';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const username = body.userName?.toString();
  const cameraIP = body.ip?.toString();
  const adminUsername = body.admin_userName?.toString();
  const adminPassword = body.pwd?.toString();

  if (!username) {
    return new Response('Missing username', { status: 400 });
  }

  const query = `name=${encodeURIComponent(username)}`;
  const url = `http://${cameraIP}/cgi-bin/userManager.cgi?action=deleteUser&${query}`;

  return await digestFetchDahua(url,adminUsername,adminPassword);
};
