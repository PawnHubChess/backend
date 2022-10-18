import { serve } from "https://deno.land/std@0.160.0/http/mod.ts";

function handleConnectHost(ws: WebSocket) {
}

function handleConnectAttendeeRequest(ws: WebSocket, code: string) {
}

function handleConnectAttendeeResponse(
  ws: WebSocket,
  clientId: string,
  accept: boolean,
) {
}

function generateHostId() {
  return "0001";
}

function generateAttendeeId() {
  return "a1234";
}

function handleMakeMove(ws: WebSocket, from: String, to: String) {
  if (checkMoveValid("hostId", from, to)) {
    ws.send(JSON.stringify({
      "type": "accept-move",
      "from": from,
      "to": to,
    }));
    // Send move to other client
  }
}

function checkMoveValid(hostId, from, to) {
  return true;
}

function checkGameWon() {
}

function handleGameWon() {
}

// WebSocket stuff

function handleConnected(ev: Event) {
  console.log(ev);
}

// deno-lint-ignore no-explicit-any
function handleMessage(ws: WebSocket, data: any) {
  switch (data.type) {
    case "connect-host":
      handleConnectHost(ws);
      break;
    case "connect-attendee":
      handleConnectAttendeeRequest(ws, data.code);
      break;
    case "accept-attendee":
      handleConnectAttendeeResponse(ws, data.clientId, true);
      break;
    case "decline-attendee":
      handleConnectAttendeeResponse(ws, data.clientId, false);
      break;
    case "make-move":
      handleMakeMove(ws, data.from, data.to);
      break;
    default:
      console.log("Unknown message type: " + data.type);
  }
}

function handleError(e: Event | ErrorEvent) {
  console.log(e instanceof ErrorEvent ? e.message : e.type);
}

function reqHandler(req: Request) {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 501 });
  }
  const { socket: ws, response } = Deno.upgradeWebSocket(req);

  ws.onopen = (ev) => handleConnected(ev);
  ws.onmessage = (m) => handleMessage(ws, m.data);
  ws.onclose = () => console.log("Disconnected from client ...");
  ws.onerror = (e) => handleError(e);
  return response;
}

serve(reqHandler, { port: 3000 });
