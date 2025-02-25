import WebSocket, { Server } from 'ws';
import { Server as HttpServer } from 'http';
import { courses, pendingPlayers } from './services/requestService';
import { MessageType, Player } from './types';
import { releaseId } from './utils/idGenerator';

const connectedPlayers = new Map<WebSocket, Player>();

/**
 * Opens a websocket to connect with client and processes messages and clients throughout a session.
 * @param server http server the websocket is using
 */
export const initWebSocket = (server: HttpServer) => {
    const wss = new Server({ server });

    wss.on('connection', (client) => { 
        console.log("Client connected!");

        client.on('message', (data: WebSocket.RawData) => {
            // extract playerId from data
            const playerId = retrievePlayerId(data);
            if (playerId == undefined) {
                console.error("unknown player");
                client.close();
                return;
            }

            const messageType: MessageType | undefined = data instanceof Buffer ? data.readUInt8(0) : undefined;
            switch (messageType) {
                case MessageType.Connection:
                    handleConnection(playerId, client);
                    break;
                case MessageType.Disconnection:
                    handleDisconnect(client, data);
                    return;
                case MessageType.PingPong:
                    handlePing(client, data);
                    return;
                case undefined:
                    return;
                default:
                    break;
            }
            broadcastToCourse(client, data);
        });

        client.on('close', () => {
            removePlayer(client);
            console.log("Client disconnected!");
        });

        client.on('error', (err) => {
            console.error("WebSocket error:", err);
        });
    });
};

/**
 * Retrieves the playerId of a network message.
 * @param data received data
 * @returns player's id or undefined
 */
function retrievePlayerId(data: WebSocket.RawData) {
    return data instanceof Buffer ? data.readUInt8(1) : undefined;
}

/**
 * Saves a new player connection and adds it to the connected players and course data structure.
 * @param playerId player id
 * @param client websocket of the client
 */
function handleConnection(playerId: number, client: WebSocket) {
    // not correctly registered player
    if (!pendingPlayers.has(playerId)) {
        client.close();
        console.error("player not correctly registered");
        return;
    }

    // get player from list of successfully registered players
    const courseId = pendingPlayers.get(playerId);
    pendingPlayers.delete(playerId);

    // non-existent course
    if (courseId == undefined) {
        console.error("unknown course");
        client.close();
        return;
    }   
    courses.get(courseId)!.add({playerId, client});
    connectedPlayers.set(client, {playerId, courseId});
}

/**
 * Disconnects a player by broadcasting the disconnect and closing the websocket connection.
 * @param client websocket of the client
 * @param data received data
 */
function handleDisconnect(client: WebSocket, data: WebSocket.RawData) {
    broadcastToCourse(client, data);
    client.close();
}

/**
 * Sends a pong to the client as response of a client's pong message.
 * @param client websocket of the client
 * @param data received data
 */
function handlePing(client: WebSocket, data: WebSocket.RawData) {
    client.send(data);
}

/**
 * Broadcasts a clients message to all connected clients of the same course.
 * @param sender websocket of the client sending a message
 * @param data message to be send
 */
function broadcastToCourse(sender: WebSocket, data: WebSocket.RawData) {
    const courseId = connectedPlayers.get(sender)?.courseId;

    if (courseId != undefined) {
        const players = courses.get(courseId);
        if (!players) return;
        players.forEach((player) => {
            if (player.client !== sender && player.client.readyState === WebSocket.OPEN) {
                player.client.send(data);
            }
        });
    }
}

/**
 * Removes a client from the connected players and from its course.
 * @param client websocket of the client
 */
function removePlayer(client: WebSocket) {
    const player = connectedPlayers.get(client);
    
    if (player != undefined && player.playerId != undefined && player.courseId != undefined) {
        connectedPlayers.delete(client);
        const playerId = player.playerId;
        courses.get(player.courseId)?.delete({playerId, client});
        releaseId(player.courseId, player.playerId);
    } 
}