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

      camera.getVideoEncoderConfigurationOptions(configToken, function (err, options) {
        if (err) {
          resolve(
            new Response(JSON.stringify({ error: 'Failed getting caps: ' + err.message }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            })
          );
        } else {
          // Assuming `options` is an array or has array-like properties
          const caps = {
            CompressionTypes: [],
            BitRateOptions: new Set(),
            ResolutionTypes: [],
            FPSMax: 30
          };
          
          const resolutionSet = new Set();

          (Array.isArray(options) ? options : [options]).forEach(opt => {
            if (opt.encoding) caps.CompressionTypes.push(opt.encoding.toUpperCase());

            caps.BitRateMin = opt.bitrateRange.min;
            caps.BitRateMax = opt.bitrateRange.max;

            if (opt.resolutionsAvailable) {
              opt.resolutionsAvailable.forEach(r => {
                resolutionSet.add(`${r.width}x${r.height}`);
              });
            }

            if (opt.$?.FrameRatesSupported) {
              const fps = opt.$.FrameRatesSupported.split(' ').map(Number);
              caps.FPSMax = Math.max(...fps);
            }
          });

          // Convert Set to array before sending the response
          caps.ResolutionTypes = Array.from(resolutionSet)
            .map(str => {
              const [w, h] = str.split('x').map(Number);
              return { width: w, height: h };
            })
            .sort((a, b) => (a.width * a.height) - (b.width * b.height))
            .map(r => `${r.width}x${r.height}`);

          resolve(
            new Response(JSON.stringify(caps), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            })
          );
        }
      });
    });
  });
}