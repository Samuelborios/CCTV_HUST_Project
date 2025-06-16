import DigestFetch from 'digest-fetch';

export async function digestFetchDahua(
  url: string,
  adminUsername: string,
  adminPassword: string,
): Promise<Response> {
  const client = new DigestFetch(adminUsername, adminPassword);

  try {
    const dahuaRes = await client.fetch(url);
    const text = await dahuaRes.text();

    if (text.includes('OK')) {
      return new Response('Success', { status: 200 });
    } else {
      return new Response('Dahua error: ' + text, { status: 500 });
    }
  } catch (err) {
    return new Response('Server error: ' + (err as Error).message, { status: 500 });
  }
}
