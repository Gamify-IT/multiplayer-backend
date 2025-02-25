import WebSocket from 'ws';

export interface ConnectionData {
    playerId: string;
    courseId: number;
}

export interface Player {
    playerId: number;
    courseId: number;
}

export interface CourseMember {
    playerId: number;
    client: WebSocket;
}

export enum MessageType {
    Connection = 0,
    Disconnection = 1,
    Acknowledge = 2,
    Position = 3,
    Character = 4,
    Area = 5,
    PingPong = 6
}