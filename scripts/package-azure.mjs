// Assembles the Azure App Service package in deploy/: the bundled API, the built
// client, and the Prisma schema and migrations. Run after `npm run build` and
// `npm run bundle -w server`. App Service installs the two runtime dependencies
// itself (SCM_DO_BUILD_DURING_DEPLOYMENT=true) so the Prisma engines match its OS.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'deploy');
const serverPkg = JSON.parse(readFileSync(path.join(root, 'server/package.json'), 'utf8'));

for (const required of ['server/dist/server.cjs', 'client/dist/index.html']) {
  if (!existsSync(path.join(root, required))) throw new Error(`Missing ${required}. Build before packaging.`);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
cpSync(path.join(root, 'server/dist/server.cjs'), path.join(out, 'server.cjs'));
cpSync(path.join(root, 'client/dist'), path.join(out, 'public'), { recursive: true });
cpSync(path.join(root, 'server/prisma/schema.prisma'), path.join(out, 'prisma/schema.prisma'));
cpSync(path.join(root, 'server/prisma/migrations'), path.join(out, 'prisma/migrations'), { recursive: true });

writeFileSync(path.join(out, 'package.json'), `${JSON.stringify({
  name: 'sdp-tool-app',
  private: true,
  version: serverPkg.version,
  engines: { node: '>=22' },
  scripts: {
    postinstall: 'prisma generate',
    // Migrations apply on every start, so a deploy and its schema change land together.
    start: 'prisma migrate deploy && node server.cjs',
  },
  dependencies: {
    '@prisma/client': serverPkg.dependencies['@prisma/client'],
    prisma: serverPkg.devDependencies.prisma,
  },
}, null, 2)}\n`);

// Packaging layout only. Secrets and environment settings belong in App Service configuration,
// which takes precedence over this file.
writeFileSync(path.join(out, '.env'), 'CLIENT_DIST_DIR=public\n');

console.log(`Azure package assembled in ${path.relative(root, out)}`);
