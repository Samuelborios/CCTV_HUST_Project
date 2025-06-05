import { Cam } from 'onvif';
import flow from 'nimble';

function toLong(ip) {
  let ipl = 0;
  ip.split('.').forEach(function (octet) {
    ipl <<= 8;
    ipl += parseInt(octet);
  });
  return ipl >>> 0;
}

function fromLong(ipl) {
  return (
    (ipl >>> 24) +
    '.' +
    ((ipl >> 16) & 255) +
    '.' +
    ((ipl >> 8) & 255) +
    '.' +
    (ipl & 255)
  );
}

function generate_range(start_ip, end_ip) {
  let start_long = toLong(start_ip);
  let end_long = toLong(end_ip);
  if (start_long > end_long) [start_long, end_long] = [end_long, start_long];

  const range_array = [];
  for (let i = start_long; i <= end_long; i++) {
    range_array.push(fromLong(i));
  }
  return range_array;
}

export async function scanNetwork({ username, password, supabase} = {}) {
  const IP_RANGE_START = '192.168.50.1';
  const IP_RANGE_END = '192.168.50.254';
  const ip_list = generate_range(IP_RANGE_START, IP_RANGE_END);
  const port = 80;

  const results = [];

  console.error = () => {}; // Suppress error logs

  return new Promise((resolve) => {

    let remaining = ip_list.length;

    ip_list.forEach((ip) => {
      new Cam(
        {
          hostname: ip,
          username,
          password,
          port,
          timeout: 5000,
        },
        function CamFunc(err) {
          if (!err) {
            const cam_obj = this;
            const device = {
              ip,
              port,
            };

            flow.series([
              function (cb) {
                cam_obj.getDeviceInformation((err, info) => {
                  if (!err) device.info = info;
                  cb();
                });
              },
              function (cb) {
                cam_obj.getStreamUri(
                  { protocol: 'RTSP', stream: 'RTP-Unicast' },
                  (err, stream) => {
                    if (!err) device.rtsp = stream.uri;
                    cb();
                  }
                );
              },

              async function (cb) {
                results.push(device);

                if (supabase && device.info) {
                  const { manufacturer, model, firmwareVersion, serialNumber } = device.info;

                  try {
                    const insertData = {
                      ip: device.ip,
                      port: Number(device.port) || null,
                      manufacturer: device.info.manufacturer || null,
                      model: device.info.model || null,
                      firmware: device.info.firmwareVersion || null,
                      serial: device.info.serialNumber || null,
                    };

                    const { error } = await supabase.from('cameras').upsert(insertData, { onConflict: ['ip'] });

                    if (error) {
                      console.log(`Supabase insert error for IP ${device.ip}:`, error);
                    }
                  } catch (e) {
                    console.log(`Insert failed for ${device.ip}:`, e);
                  }
                }

                cb();
              },
            ]);
          }

          if (--remaining === 0) {
            resolve(results);
          }
        }
      );
    });
  });
}

