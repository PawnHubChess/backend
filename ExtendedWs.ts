export class ExtendedWs extends WebSocket {
  id: string | undefined = undefined;
  reconnectCode: string | undefined = undefined;

  constructor(ws: WebSocket) {
    super(ws.url);
  }
}
