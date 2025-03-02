import WebSocket from 'ws';

export interface ConnectionData {
    playerId: string;
    clientId?: number;
    courseId: number;
}

export interface Client {
    clientId: number;
    courseId?: number;
    ws?: WebSocket;
}

export enum MessageType {
    Connection = 0,
    Disconnection = 1,
    Acknowledge = 2,
    Position = 3,
    Character = 4,
    Area = 5,
    Timeout = 6
}