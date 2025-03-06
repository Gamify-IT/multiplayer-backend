import WebSocket from 'ws';
import { releaseId } from '../utils/idGenerator';
import { connectedClients, courses, knownClients, pendingClients } from '../data/data';
import { Client } from '../types';

/**
 * Retrieves the client's id of a network message.
 * @param data received data
 * @returns client's id or undefined
 */
export function retrieveClientId(data: WebSocket.RawData) {
    return data instanceof Buffer ? data[1] | (data[2] << 8) : undefined;
}

/**
 * Creates a disconnection message for this client.
 * @param clientId client id
 * @returns disconnection network message
 */
export function createDisconnectionMessage(clientId: number) : Uint8Array {
    let index = 0;
    let data = new Uint8Array(3); // 1 byte message type, 2 byte client id
    
    data[index] = 1; // disconnection message type = 1
    index++;
    
    data[index] = clientId & 0xFF;
    data[index + 1] = (clientId >> 8) & 0xFF;

    return data;
}

/**
 * Saves the new client connection and adds it to the connected clients map, the known clients list and the clients course.
 * @param clientId client id
 * @param ws websocket of the client
 */
export function handleConnection(clientId: number, ws: WebSocket) {
    // new and correct registered client
    if (pendingClients.has(clientId)) {
        // get client from list of successfully registered new clients
        const courseId = pendingClients.get(clientId)!;
        pendingClients.delete(clientId);

        // non-existent course
        if (courseId == undefined || clientId == undefined) {
            disconnectClient(ws);
            return;
        }
        courses.get(courseId)?.add({ clientId: clientId, ws: ws });
        connectedClients.set(ws, { clientId: clientId, courseId: courseId });
        return;
    }
    // reconnection of already known client
    else if (knownClients.has(clientId)) {
        const courseId = knownClients.get(clientId)!;
        courses.get(courseId)?.add({ clientId: clientId, ws: ws });
        connectedClients.set(ws, { clientId: clientId, courseId: courseId });
        return;
    }
    // unknown client
    else {
        disconnectClient(ws);
    }
}

/**
 * Disconnects the client. Includes broadcasting the disconnect and closing the websocket connection.
 * @param client websocket of the client
 * @param data received data
 */
export function handleDisconnect(client: WebSocket, data: WebSocket.RawData) {
    broadcastToCourse(client, data);
    disconnectClient(client);
}

/**
 * Pauses the clients websocket connection with the possibility to reconnect later.
 * @param client websocket of the client
 */
export function handleTimeout(client: WebSocket, data: WebSocket.RawData) {
    broadcastToCourse(client, data)
    pauseClient(client);
}

/**
 * Broadcasts the clients message to all connected clients of the same course.
 * @param sender websocket of the client sending a message
 * @param data message to be send
 */
export function broadcastToCourse(sender: WebSocket, data: WebSocket.RawData | Uint8Array) {
    const courseId = connectedClients.get(sender)?.courseId!;
    const clients = courses.get(courseId);
    if (clients != undefined) {
        clients.forEach((client) => {
            if (client.ws !== sender && client.ws!.readyState === WebSocket.OPEN) {
                client.ws!.send(data);
            }
        });
    }
}

/**
 * Removes the client permanently from every data structured.
 * @param ws websocket of the client
 */
export function removeClient(ws: WebSocket) {
    const client = connectedClients.get(ws);
    if (client != undefined && client.clientId != undefined && client.courseId != undefined) {
        connectedClients.delete(ws);
        knownClients.delete(client.clientId);
        removePlayerFromCourse(client, ws);
        releaseId(client.clientId);
    }
}

/**
 * Removes the client only from the connected players. Allows future reconnection.
 * @param ws websocket of the client
 */
export function pauseClient(ws: WebSocket) {
    const client = connectedClients.get(ws);
    if (client != undefined && client.clientId != undefined && client.courseId != undefined) {
        connectedClients.delete(ws);
        removePlayerFromCourse(client, ws);
        ws.close();
    }
}

/**
 * Removes the client from its course.
 * @param client connected client
 * @param client websocket of the client
 */
export function removePlayerFromCourse(client: Client, ws: WebSocket) {
    if (client.courseId != undefined) {
        courses.get(client.courseId)?.delete({ clientId: client.clientId, ws: ws });
    }
}

/**
 * Disconnects the clients without the possibility to reconnect.
 * @param ws websocket of the client
 */
export function disconnectClient(ws: WebSocket) {
    removeClient(ws);
    ws.close();
}