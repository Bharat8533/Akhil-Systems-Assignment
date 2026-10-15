const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

async function start() {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`QuickCare API running on port ${PORT}`);
  });
}

function shutdown() {
  if (!server) return process.exit(0);
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});