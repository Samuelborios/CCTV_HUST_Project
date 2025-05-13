import type { APIRoute } from 'astro';
import DigestFetch from 'digest-fetch';

const cameraIP = '192.168.50.99';
const adminUsername = 'admin';
const adminPassword = 'Bkcs@123';

type DahuaUser = {
  id?: string;
  name?: string;
  group?: string;
  memo?: string;
};

export const GET: APIRoute = async () => {
  const client = new DigestFetch(adminUsername, adminPassword);

  try {
    const res = await client.fetch(`http://${cameraIP}/cgi-bin/userManager.cgi?action=getUserInfoAll`);
    const text = await res.text();

    const lines = text.split('\n');
    const userObjects: Record<string, DahuaUser> = {};

    for (const line of lines) {
      const match = line.match(/^users\[(\d+)\]\.(\w+)=([\s\S]*)$/);
      if (!match) continue;

      const [_, index, key, value] = match;

      if (!userObjects[index]) userObjects[index] = {};

      switch (key) {
        case 'Id':
          userObjects[index].id = value;
          break;
        case 'Name':
          userObjects[index].name = value;
          break;
        case 'Group':
          userObjects[index].group = value;
          break;
        case 'Memo':
          userObjects[index].memo = value;
          break;
      }
    }

    const users = Object.values(userObjects);
    return new Response(JSON.stringify({ users }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error while fetching users' }), {
      status: 500,
    });
  }
};
