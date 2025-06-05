import type { APIRoute } from 'astro';
import DigestFetch from 'digest-fetch';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  const userName = body.username?.toString() ?? '';
  const userPassword = body.password?.toString() ?? '';
  const userGroup = body.group?.toString() ?? '';
  const userMemo = body.memo?.toString() ?? 'Added via web';
  const cameraIP = body.ip?.toString();
  const adminUsername = body.admin_userName?.toString();
  const adminPassword = body.admin_password?.toString();

  if (!userName || !userPassword || !userGroup) {
    return new Response('Missing inputs', { status: 400 });
  }

  const query = [
    `user.Name=${encodeURIComponent(userName)}`,
    `user.Password=${encodeURIComponent(userPassword)}`,
    `user.Memo=${encodeURIComponent(userMemo)}`,
    `user.Group=${encodeURIComponent(userGroup)}`,
    `user.Sharable=true`,
    `user.Reserved=false`,
  ].join('&');

  const url = `http://${cameraIP}/cgi-bin/userManager.cgi?action=addUser&${query}`;
  const client = new DigestFetch(adminUsername, adminPassword);

  try {
    const dahuaRes = await client.fetch(url);
    const text = await dahuaRes.text();

    if (text.includes('OK')) {
      return new Response('User added successfully', { status: 200 });
    } else {
      return new Response('Dahua error : ' + text, { status: 500 });
    }
  } catch (err) {
    return new Response('Server error : ' + (err as Error).message, { status: 500 });
  }
};
