import WebSocket, { Server } from 'ws';
import { Server as HttpServer } from 'http';
import { courses, pendingPlayers } from './services/requestService';
import { Player } from './types';
import { releaseId } from './utils/idGenerator';

const connectedPlayers = new Map<WebSocket, Player>();

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

            const messageType = data instanceof Buffer ? data.readUInt8(0) : undefined;
            switch (messageType) {
                case 0:
                    handleConnection(playerId, client);
                    break;
                case 1:
                    handleDisconnect(client, data);
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

function retrievePlayerId(data: WebSocket.RawData) {
    return data instanceof Buffer ? data.readUInt8(1) : undefined;
}

function handleConnection(playerId: number, client: WebSocket) {
    // not correctly registered player
    if (!pendingPlayers.has(playerId)) {
        client.close();
        console.error("player nor correctly registered");
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

function handleDisconnect(client: WebSocket, data: WebSocket.RawData) {
    broadcastToCourse(client, data);
    client.close();
}

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

function removePlayer(client: WebSocket) {
    const player = connectedPlayers.get(client);
    
    if (player != undefined && player.playerId != undefined && player.courseId != undefined) {
        connectedPlayers.delete(client);
        const playerId = player.playerId;
        courses.get(player.courseId)?.delete({playerId, client});
        releaseId(player.courseId, player.playerId);
    } 
}