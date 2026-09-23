import { spawn } from 'node:child_process';

const children = [];
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) {
    if (!child.pid) continue;
    if (process.platform === 'win32') {
      // npm launches descendants; stop the whole tree on Windows.
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      try { process.kill(-child.pid, 'SIGTERM'); } catch (error) {
        if (error.code !== 'ESRCH') throw error;
      }
    }
  }
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

if (!process.env.npm_execpath) {
  console.error('Start the development servers with npm run dev.');
  process.exit(1);
}

for (const workspace of ['server', 'client']) {
  const env = { ...process.env, NO_COLOR: '1', TERM: 'dumb' };
  delete env.FORCE_COLOR;
  const screenFlag = workspace === 'client' ? '--clearScreen=false' : '--clear-screen=false';
  const child = spawn(process.execPath, [process.env.npm_execpath, 'run', 'dev', '-w', workspace, '--', screenFlag], {
    env,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
  });
  children.push(child);
  child.on('error', (error) => {
    console.error(`Could not start ${workspace}: ${error.message}`);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping) {
      console.error(`${workspace} development process exited; stopping both servers.`);
      stop(code ?? 1);
    }
  });
}
