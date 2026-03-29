import 'dotenv/config';
import { startServer } from './infrastructure/api/config/server.js';

startServer().catch((error) => {
  console.log('[Error starting server]: ', error);
  process.exit(1);
});
