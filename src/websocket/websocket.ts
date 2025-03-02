import WebSocket, { Server } from 'ws';
import { Server as HttpServer } from 'http';
import { MessageType } from '../types';
import { Buffer } from 'buffer';
import { broadcastToCourse, disconnectClient, handleConnection, handleDisconnect, handleTimeout, removeClient, retrieveClientId } from './websocketService';

/**
 * Opens a websocket to connect with client and processes messages and clients throughout a session.
 * @param server http server the websocket is using
 */
export const initWebSocket = (server: HttpServer) => {
    const wss = new Server({ server });

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
                // TODO: create disconnect message and broadcast disconnect in client's course
                removeClient(ws);
            }
        });

        ws.on('error', (err) => {
            console.error("WebSocket error:", err);
        });
    });
};