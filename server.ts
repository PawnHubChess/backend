import { isPortAvailableSync, parse, serve } from "./deps.ts";
import { applyReconnectCode, ExtendedWs } from "./ExtendedWs.ts";
import {
  handleAcceptAttendeeRequest,
  handleDeclineAttendeeRequest,
} from "./matchmaking.ts";
import {
  createAndSubscribeToIdQueue,
  publish,
} from "./MessageBrokerInterface.ts";
import {
  handleDisconnected,
  handleGetBoard,
  handleMakeMove,
} from "./playing.ts";
import {
  completeReconnectTransaction,
  generateReconnectCode,
  startReconnectTransaction,
  verifyReconnectCode,
} from "./ReconnectHandler.ts";
import { findGameById, findWsById } from "./serverstate.ts";
import {
  connect,
  getId,
  sendMessageToId,
  sendRequestMessage,
} from "./WebSocketInterface.ts";

// CLI options
export const flags = parse(Deno.args, {
  boolean: ["debug"],
});
if (flags.debug) console.warn("Running in debug mode");

// WebSocket stuff

// Rewire is not yet available for Deno; export for testing
// deno-lint-ignore no-explicit-any
export function handleMessage(ws: ExtendedWs, data: any) {
  switch (data.type) {
    case "accept-attendee-request":
      handleAcceptAttendeeRequest(ws, data.clientId);
      break;
    case "decline-attendee-request":
      handleDeclineAttendeeRequest(data.clientId);
      break;
    case "send-move":
      handleMakeMove(ws, data.from, data.to);
      break;
    case "get-board":
      handleGetBoard(ws);
      break;
    case "disconnect":
      handleDisconnected(ws.id!);
      break;
    default:
      console.log("Unknown message type: " + data.type);
  }
}

export function handleInstanceMessage(id: string, message: any) {
  switch (message.type) {
    case "connect-request":
      handleReceiveRequest(id, message);
      break;
  }
}

function handleError(e: Event | ErrorEvent) {
  console.log(e instanceof ErrorEvent ? e.message : e.type);
}

function handleDisconnect(ws: ExtendedWs) {
  const id = getId(ws);
  if (!id) return;
  startReconnectTransaction(id);
}

function reqHandler(req: Request) {
  if (req.headers.get("upgrade") != "websocket") {
    return Response.redirect(
      "https://github.com/PawnHubChess/backend/wiki",
      302,
    );
  }
  const { socket: ws, response } = Deno.upgradeWebSocket(req);

  ws.onmessage = (e) => handleConnected(ws, new URL(req.url));
  ws.onmessage = (m) => handleMessage(ws, JSON.parse(m.data));
  ws.onclose = () => handleDisconnect(ws);
  ws.onerror = (e) => handleError(e);
  return response;
}

async function handleConnected(ws: WebSocket, url: URL) {
  if (url.pathname === "/reconnect") {
    handleReconnect(
      ws,
      url.searchParams.get("id")!,
      url.searchParams.get("reconnectCode")!,
    );
    return;
  } else {
    const isHost = url.pathname === "/host";
    const id = await handleNewlyConnected(ws, isHost);

    if (isHost) {
      handleSendRequest(
        id,
        url.searchParams.get("id")!,
        url.searchParams.get("code")!,
      );
    }
  }
}

async function handleNewlyConnected(ws: WebSocket, isHost: boolean) {
  const id = await connect(ws, isHost);
  const reconnectCode = await generateReconnectCode(id);

  sendMessageToId(id, {
    type: "connected",
    host: isHost,
    id: id,
    reconnectCode: reconnectCode,
  });

  createAndSubscribeToIdQueue(
    id,
    (message) => handleInstanceMessage(id, message),
  );

  return id;
}

async function handleReconnect(
  ws: WebSocket,
  id: string,
  reconnectCode: string,
) {
  if (verifyReconnectCode(id, reconnectCode)) {
    const newCode = await completeReconnectTransaction(id);
    connect(ws, false, id);
    sendMessageToId(id, {
      type: "reconnected",
      reconnectCode: newCode,
    });
  } else {
    ws.send(JSON.stringify({
      type: "error",
      error: "wrong-code",
    }));
    ws.close();
  }
}

async function handleSendRequest(
  ownId: string,
  recipientId: string,
  code: string,
) {
  try {
    await publish(recipientId, {
      type: "connect-request",
      id: ownId,
      code: code,
    });
  } catch (e) {
    // Error is most probably caused by queue not existing
    sendMessageToId(ownId, {
      type: "request-declined",
      details: "nonexistent",
      message: "Host does not exist",
    });
  }
}

function handleReceiveRequest(ownId: string, message: any) {
  const senderId = message.id;
  const code = message.code;
  sendRequestMessage(ownId, senderId, code);
}

if (isPortAvailableSync({ port: 3000 })) {
  serve(reqHandler, { port: 3000 });
}
