import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
import { attachIdentity } from './middleware/auth';
import { meRouter } from './routes/me';
import { sdpRouter } from './routes/sdp';
import { journalRouter } from './routes/journal';
import { teamRouter } from './routes/team';
import { hrRouter } from './routes/hr';
import { checkInsRouter } from './routes/checkins';
import { supportNeedsRouter } from './routes/supportNeeds';
import { adminRouter } from './routes/admin';
import { errorHandler, notFound } from './lib/errors';

export function createApp() {
  const app = express(); app.disable('x-powered-by'); app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false })); app.use(cors({ origin: config.CLIENT_ORIGIN, credentials: true })); app.use(express.json({ limit: '256kb' })); app.use('/api', rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' })); app.use('/api', attachIdentity);
  app.use('/api/me', meRouter); app.use('/api/sdp', sdpRouter); app.use('/api/checkins', checkInsRouter); app.use('/api/support-needs', supportNeedsRouter); app.use('/api/journal', journalRouter); app.use('/api/team', teamRouter); app.use('/api/hr', hrRouter); app.use('/api/admin', adminRouter);
  app.use(notFound); app.use(errorHandler); return app;
}
