import { Client } from "../types";
import WebSocket from 'ws';

// maps to each client id its course id
export const knownClients = new Map<number, number>();
// maps to each websocket the client 
export const connectedClients = new Map<WebSocket, Client>();  
// maps to each course a set of its clients ids
export const courses = new Map<number, Set<Client>>();
// maps to each client id its course id
export const pendingClients = new Map<number, number>();