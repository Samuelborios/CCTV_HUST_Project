export async function POST({ request }) {
  const { Cam } = await import('onvif');
  const { ip, BitRate, Compression, FPS, Width, Height } = await request.json();

  if (!ip || ip === "Unknown IP") {
    return new Response(JSON.stringify({ error: 'No IP provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Promise((resolve) => {
    const configToken = '00000';

    const camera = new Cam({
      hostname: ip,
      username: 'admin',
      password: 'Bkcs@123',
      port: 80,
    }, function (err) {
      if (err) {
        resolve(new Response(JSON.stringify({ error: 'Connection failed: ' + err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }));
        return;
      }

      const config = {
        token: configToken,
        encoding: Compression,
        resolution: {
          width: parseInt(Width),
          height: parseInt(Height),
        },
        rateControl: {
          frameRateLimit: parseInt(FPS),
          bitrateLimit: parseInt(BitRate),
        },
      };

      camera.setVideoEncoderConfiguration(config, function (err) {
        if (err) {
          resolve(new Response(JSON.stringify({ error: 'Failed to apply settings: ' + err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
        } else {
          resolve(new Response(JSON.stringify({ message: 'Video config updated successfully ✔' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      });
    });
  });
}
