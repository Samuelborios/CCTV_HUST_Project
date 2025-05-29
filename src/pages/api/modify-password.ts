import type { APIRoute } from 'astro';
import DigestFetch from 'digest-fetch';

const cameraIP = '192.168.50.99';
const adminUsername = 'admin';
const adminPassword = 'Bkcs@123';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const userName = body.name?.toString();
  const oldPwd = body.pwdOld?.toString();
  const newPwd = body.pwd?.toString();

  if (!userName || !oldPwd || !newPwd) {
    return new Response('Missing required fields', { status: 400 });
  }

  const query = `name=${encodeURIComponent(userName)}&pwd=${encodeURIComponent(newPwd)}&pwdOld=${encodeURIComponent(oldPwd)}`;
  const url = `http://${cameraIP}/cgi-bin/userManager.cgi?action=modifyPassword&${query}`;
  const client = new DigestFetch(adminUsername, adminPassword);

  try {
    const dahuaRes = await client.fetch(url);
    const text = await dahuaRes.text();

    if (text.includes('OK')) {
      return new Response('OK', { status: 200 });
    } else {
      return new Response('Dahua error: ' + text, { status: 500 });
    }
  } catch (err) {
    return new Response('Server error: ' + (err as Error).message, { status: 500 });
  }
};
