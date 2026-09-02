import { createApp } from './app';
import { config } from './config';
import { prisma } from './lib/db';

const server = createApp().listen(config.PORT, () => console.log(`SDP server listening on http://localhost:${config.PORT}`));
async function shutdown() { server.close(async () => { await prisma.$disconnect(); process.exit(0); }); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
