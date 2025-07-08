import { Cam } from 'onvif';
import flow from 'nimble';
import { networkInterfaces } from 'os';


function toLong(ip) {
  return ip.split('.').reduce((ipl, octet) => (ipl << 8) + parseInt(octet), 0) >>> 0;
}

function fromLong(ipl) {
  return `${ipl >>> 24}.${(ipl >> 16) & 255}.${(ipl >> 8) & 255}.${ipl & 255}`;
}

function generate_range(start_ip, end_ip) {
  let start = toLong(start_ip), end = toLong(end_ip);
  if (start > end) [start, end] = [end, start];
  return Array.from({ length: end - start + 1 }, (_, i) => fromLong(start + i));
}

function getLocalSubnetRange() {
  const nets = networkInterfaces();

  const interfaceNames = ['Wi-Fi', 'wlan0', 'wlp2s0'];

  for (const iface of interfaceNames) {
    const addresses = nets[iface];
    if (!addresses) continue;

    for (const net of addresses) {
      if (net.family === 'IPv4') {
        const parts = net.address.split('.');
        return {
          start: `${parts[0]}.${parts[1]}.${parts[2]}.1`,
          end: `${parts[0]}.${parts[1]}.${parts[2]}.254`,
        };
      }
    }
  }

  // Fallback if no Wi-Fi interface found
  for (const addresses of Object.values(nets)) {
    for (const net of addresses) {
      if (net.family === 'IPv4') {
        const parts = net.address.split('.');
        return {
          start: `${parts[0]}.${parts[1]}.${parts[2]}.1`,
          end: `${parts[0]}.${parts[1]}.${parts[2]}.254`,
        };
      }
    }
  }

  return null;
}

function handleCamera(ip, username, password, port, supabase, results, done) {
  const camera = new Cam({ hostname: ip, username, password, port, timeout: 5000 }, function (err) {
    if (err) return done();

    const device = { ip, port };

    flow.series([
      cb => getDeviceInfo(camera, device, cb),
      cb => getStreamUri(camera, device, cb),
      cb => saveToSupabase(device, supabase).finally(cb),
    ], () => {
      results.push(device);
      done();
    });
  });
}

function getDeviceInfo(camera, device, cb) {
  camera.getDeviceInformation((err, info) => {
    if (!err) device.info = info;
    cb();
  });
}

function getStreamUri(camera, device, cb) {
  camera.getStreamUri({ protocol: 'RTSP', stream: 'RTP-Unicast' }, (err, stream) => {
    if (!err) device.rtsp = stream.uri;
    cb();
  });
}

async function saveToSupabase(device, supabase) {
  if (!supabase || !device.info) return;
  const insertData = {
    ip: device.ip,
    port: Number(device.port) || null,
    manufacturer: device.info.manufacturer || null,
    model: device.info.model || null,
    firmware: device.info.firmwareVersion || null,
    serial: device.info.serialNumber || null,
  };

  try {
    const { error } = await supabase.from('cameras').upsert(insertData, { onConflict: ['ip'] });
    if (error) console.log(`Supabase insert error for IP ${device.ip}:`, error);
  } catch (e) {
    console.log(`Insert failed for ${device.ip}:`, e);
  }
}


export async function scanNetwork({ username, password, supabase } = {}) {
  const range = getLocalSubnetRange();
  if (!range) return [];

  const ip_list = generate_range(range.start, range.end);
  const port = 80;
  const results = [];

  return new Promise((resolve) => {
    let remaining = ip_list.length;
    console.error = () => {}; // suppress logs

    ip_list.forEach(ip =>
      handleCamera(ip, username, password, port, supabase, results, () => {
        if (--remaining === 0) resolve(results);
      })
    );
  });
}
