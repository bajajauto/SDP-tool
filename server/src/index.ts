import express from 'express';
import cors from 'cors';
import { attachIdentity } from './middleware/auth';
import { meRouter } from './routes/me';
import { sdpRouter } from './routes/sdp';
import { journalRouter } from './routes/journal';
import { teamRouter } from './routes/team';
import { hrRouter } from './routes/hr';

const app = express();
const port = process.env.PORT ?? 4100;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/api', attachIdentity);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/me', meRouter);
app.use('/api/sdp', sdpRouter);
app.use('/api/journal', journalRouter);
app.use('/api/team', teamRouter);
app.use('/api/hr', hrRouter);

app.listen(port, () => {
  console.log(`SDP server listening on http://localhost:${port}`);
});
