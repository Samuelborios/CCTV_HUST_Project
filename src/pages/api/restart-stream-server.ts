import type { APIRoute } from 'astro';
import { exec } from 'child_process';

function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout);
    });
  });
}

export const POST: APIRoute = async () => {
  const containerName = 'rtsptoweb';
  const dockerRunCmd = `docker run --name ${containerName} --restart unless-stopped -v "${process.cwd()}/certs:/config" -p 8083:8083 -p 443:443 -p 5541:5541 ghcr.io/deepch/rtsptoweb:latest`;

  try {
    // Stop the container if it's already running
    await runCommand(`docker rm -f ${containerName}`).catch(() => {
      console.log(`Container ${containerName} not running or already removed.`);
    });

    await runCommand(dockerRunCmd);
    
    return new Response(JSON.stringify({ success: true, message: 'Docker restarted successfully ✔' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
