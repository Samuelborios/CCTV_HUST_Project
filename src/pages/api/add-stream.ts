// src/pages/api/add-stream.ts
import type { APIRoute } from 'astro';
import fs from 'fs';

export const POST: APIRoute = async ({request}) => {

  const {name, pwd } = await request.json();
  const filePath = 'certs/config.json';
  const streamKey = "stream192.168.50.99";
  const streamUrl = "rtsp://"+name+":"+pwd+"@192.168.50.99:554";

  try {
    // Step 1: Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(fileContent);

    // Step 2: Check if the stream already exists
    if (json.streams[streamKey]) {
      return new Response(JSON.stringify({ success: false, message: 'Stream already exists' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Add new stream
    json.streams[streamKey] = {
      channels: {
        "0": {
          debug: true,
          url: streamUrl
        }
      },
      name: streamKey
    };

    // Step 4: Write back the file
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.log(err);
    console.error('Error updating config:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
};
