import { serve } from "https://deno.land/std@0.160.0/http/mod.ts";

function handleConnectHost() {
}

function handleConnectAttendeeRequest() {
}

function handleConnectAttendeeResponse() {
}

function generateHostId() {
  return "0001";
}

function generateAttendeeId() {
  return "a1234";
}

function handleMakeMove(ws: WebSocket, from: String, to: String) {
  if (checkMoveValid("gameid", from, to)) {
    ws.send(JSON.stringify({
      "type": "accept-move",
      "from": from,
      "to": to,
    }));
    // Send move to other client
  }
}

function checkMoveValid(gameid, from, to) {
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

function handleMessage(ws: WebSocket, data: string) {
  console.log("CLIENT >> " + data);
  ws.send(data as string);
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
