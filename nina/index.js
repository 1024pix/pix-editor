import { createServer } from './server.js';
async function start() {
  try {
    const server = await createServer();
    await server.start();
    console.log('Server running at %s', server.info.uri);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
