import { ExtendedWs } from "./ExtendedWs.ts";

export class ConnectRequest {
    attendeeId: string;
    connectTo: string;
    ws: ExtendedWs;

     constructor(attendeeId: string, hostId: string, ws: ExtendedWs) {
        this.attendeeId = attendeeId;
        this.connectTo = hostId;
        this.ws = ws;
    }
}