export async function POST({ request }) {
  const { Cam } = await import('onvif');
  const { ip, port, uname, pwd } = await request.json();

  if (!ip || ip === "Unknown IP") {
    return new Response(JSON.stringify({ error: 'No IP provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Promise((resolve) => {
    const camera = new Cam({
      hostname: ip,
      username: uname,
      password: pwd,
      port: port,
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

      camera.systemReboot((err) => {
        if (err) {
          resolve(
            new Response(JSON.stringify({ error: 'Reboot failed: ' + err.message }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            })
          );
        } else {
          resolve(
            new Response(JSON.stringify({ message: 'Camera reboot initiated.' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            })
          );
        }
      });
    });
  });
}