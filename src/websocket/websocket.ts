import WebSocket, { Server } from 'ws';
import { Server as HttpServer } from 'http';
import { MessageType } from '../types';
import { Buffer } from 'buffer';
import { broadcastToCourse, createDisconnectionMessage, disconnectClient, handleConnection, handleDisconnect, handleTimeout, removeClient, retrieveClientId } from './websocketService';
import { connectedClients } from '../data/data';
import cookie from 'cookie';
import { validateTokenOrThrow } from '../authentification/jwtValidator';

/**
 * Opens a websocket to connect with client and processes messages and clients throughout a session.
 * @param server http server the websocket is using
 */
export const initWebSocket = (server: HttpServer) => {
    const wss = new Server({ 
        server,
        verifyClient: async (info, done) => {
            try {
                const cookies = cookie.parse(info.req.headers.cookie || '');
                const token = cookies['access_token'];

                if (!token) {
                    console.log("Missing JWT cookie");
                    return done(false, 401, "Unauthorized");
                }

                await validateTokenOrThrow(token);
                done(true);
            }
            catch (err: any) {
                console.error("JWT validation failed:" + err.message);
                done(false, 401, "Unauthorized");
            }
        }
    });

    wss.on('connection', (ws) => {
        console.log("client connected");

        ws.on('message', (data: WebSocket.RawData) => {
            // get playerId from data
            const clientId = retrieveClientId(data);
            if (clientId == undefined) {
                console.log("unknown client id");
                disconnectClient(ws);
                return;
            }

            // process message depending on its type
            const messageType: MessageType | undefined = data instanceof Buffer ? data.readUInt8(0) : undefined;
            switch (messageType) {
                case MessageType.Connection:
                    handleConnection(clientId, ws);
                    break;
                case MessageType.Disconnection:
                    handleDisconnect(ws, data);
                    return;
                case MessageType.Timeout:
                    handleTimeout(ws, data);
                    return;
                case undefined:
                    disconnectClient(ws);
                    return;
                default:
                    break;
            }
            broadcastToCourse(ws, data);
        });

        ws.on('close', (code) => {
            console.log("client disconnected");
            // remove client data if graceful disconnect
            if (code !== 1000) {
                console.log("unexpected disconnect");
                // create disconnect message and broadcast disconnect in client's course
                const client = connectedClients.get(ws);
                if (client !== undefined) {
                    const data = createDisconnectionMessage(client.clientId);
                    broadcastToCourse(ws, data);
                }
                removeClient(ws);
            }
        });

        ws.on('error', (err) => {
            console.error("WebSocket error:", err);
        });
    });
};