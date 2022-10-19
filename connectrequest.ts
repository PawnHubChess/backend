export class ConnectRequest {
    attendeeId: string;
    connectTo: string;
    ws: WebSocket;

     constructor(attendeeId: string, hostId: string, ws: WebSocket) {
        this.attendeeId = attendeeId;
        this.connectTo = hostId;
        this.ws = ws;
    }
}