export async function POST({ request }) {
  const { Cam } = await import('onvif');
  const { ip } = await request.json();

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
    }, function(err) {
      if (err) {
        resolve(
          new Response(JSON.stringify({ error: 'Connection failed: ' + err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        );
        return;
      }

      camera.getVideoEncoderConfiguration(configToken, function (err, config) {
        if (err) {
          resolve(
            new Response(JSON.stringify({ error: 'Failed to get video configuration: ' + err.message }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            })
          );
          return;
        }

        // Parse and structure the config
        const parsed = {
          BitRate: config?.rateControl?.bitrateLimit,
          Compression: config?.encoding,
          FPS: config?.rateControl?.frameRateLimit,
          Width: config?.resolution?.width,
          Height: config?.resolution?.height,
          Profile: config?.h264?.profile || config?.h265?.profile, // Depending on encoding
        };

        resolve(
          new Response(JSON.stringify(parsed), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        );
      });
    });
  });
}
