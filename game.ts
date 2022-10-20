import { Board } from "./Board.ts";

export class Game {
    hostId: string;
    hostWs: WebSocket;
    attendeeId: string | null = null;
    attendeeWs: WebSocket | null = null;
    board: Board = new Board();

    constructor(hostId: string, hostWs: WebSocket) {
        this.hostId = hostId;
        this.hostWs = hostWs;
    }
}