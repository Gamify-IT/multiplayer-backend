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