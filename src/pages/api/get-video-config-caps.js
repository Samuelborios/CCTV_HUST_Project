export async function POST({ request }) {
  const { Cam } = await import('onvif');
  const { ip, port, uname, pwd } = await request.json();

  if (!ip || ip === "Unknown IP") {
    return jsonResponse({ error: 'No IP provided' }, 400);
  }

  return connectToCamera(Cam, { ip, port, uname, pwd });
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function connectToCamera(Cam, { ip, port, uname, pwd }) {
  const configToken = '00000';

  return new Promise((resolve) => {
    const camera = new Cam({
      hostname: ip,
      username: uname,
      password: pwd,
      port: port,
    }, function(err) {
      if (err) {
        resolve(jsonResponse({ error: 'Connection failed: ' + err.message }, 500));
        return;
      }

      camera.getVideoEncoderConfigurationOptions(configToken, function(err, options) {
        if (err) {
          resolve(jsonResponse({ error: 'Failed getting caps: ' + err.message }, 500));
        } else {
          const caps = extractCapabilities(options);
          resolve(jsonResponse(caps, 200));
        }
      });
    });
  });
}

function extractCapabilities(options) {
  const caps = {
    CompressionTypes: [],
    BitRateOptions: new Set(),
    ResolutionTypes: [],
    FPSMax: 30
  };

  const resolutionSet = new Set();
  (Array.isArray(options) ? options : [options]).forEach(opt => {
    if (opt.encoding) {
      caps.CompressionTypes.push(opt.encoding.toUpperCase());
    }

    caps.BitRateMin = opt.bitrateRange?.min;
    caps.BitRateMax = opt.bitrateRange?.max;

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

  caps.ResolutionTypes = Array.from(resolutionSet)
    .map(str => {
      const [w, h] = str.split('x').map(Number);
      return { width: w, height: h };
    })
    .sort((a, b) => (a.width * a.height) - (b.width * b.height))
    .map(r => `${r.width}x${r.height}`);

  return caps;
}
