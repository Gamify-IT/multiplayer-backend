import { createServer } from 'http';
import { app } from './app';
import { initWebSocket } from './websocket/websocket';

const server = createServer(app);
initWebSocket(server);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});