import { serve } from "./deps.ts";
import { ExtendedWs } from "./ExtendedWs.ts";
import { handleConnectHost,handleConnectAttendeeRequest,handleAcceptAttendeeRequest,handleDeclineAttendeeRequest, handleConnected } from "./matchmaking.ts";
import { handleMakeMove } from "./playing.ts";
import { closeGameByHostId, removeAttendeeFromGame } from "./serverstate.ts";

// WebSocket stuff

// deno-lint-ignore no-explicit-any
function handleMessage(ws: ExtendedWs, data: any) {
  switch (data.type) {
    case "connect-host":
      handleConnectHost(ws);
      break;
    case "connect-attendee":
      handleConnectAttendeeRequest(ws, data.host, data.code);
      break;
    case "accept-attendee-request":
      handleAcceptAttendeeRequest(ws, data.clientId);
      break;
    case "decline-attendee-request":
      handleDeclineAttendeeRequest(data.clientId);
      break;
    case "send-move":
      handleMakeMove(ws, data.from, data.to);
      break;
    default:
      console.log("Unknown message type: " + data.type);
  }
}

function handleError(e: Event | ErrorEvent) {
  console.log(e instanceof ErrorEvent ? e.message : e.type);
}

function handleDisconnect(ws: ExtendedWs) {
  //@ts-ignore Custom property added to the websocket
  const id = ws.id;
  console.log(`Disconnected from client (${id})`);

  if (!id) return;

  if (id.length == 4) handleDisconnectHost(id);
  else handleDisconnectAttendee(id);
}

function handleDisconnectHost(id: string) {
  // todo notify attendee
  closeGameByHostId(id);
}

function handleDisconnectAttendee(id: string) {
  removeAttendeeFromGame(id);
  // todo notify host
}

function reqHandler(req: Request) {
  if (req.headers.get("upgrade") != "websocket") {
    return Response.redirect(
      "https://github.com/PawnHubChess/backend/wiki",
      302,
    );
  }
  const { socket: ws, response } = Deno.upgradeWebSocket(req);
  const ews = ws as ExtendedWs

  ews.onopen = (ev) => handleConnected(ews, ev);
  ews.onmessage = (m) => handleMessage(ews, JSON.parse(m.data));
  ews.onclose = () => handleDisconnect(ews);
  ews.onerror = (e) => handleError(e);
  return response;
}

serve(reqHandler, { port: 3000 });
