import { isPortAvailableSync, parse, serve, wsi, amqp, wsHandlers, amqpHandlers } from "./deps.ts";
import { ExtendedWs } from "./ExtendedWs.ts";
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

// CLI options
export const flags = parse(Deno.args, {
  boolean: ["debug"],
});
if (flags.debug) console.warn("Running in debug mode");

// WebSocket stuff

// Rewire is not yet available for Deno; export for testing
// deno-lint-ignore no-explicit-any
function handleMessage(ws: ExtendedWs, data: any) {
  switch (data.type) {
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

function handleError(e: Event | ErrorEvent) {
  console.log(e instanceof ErrorEvent ? e.message : e.type);
}

function reqHandler(req: Request) {
  if (req.headers.get("upgrade") != "websocket") {
    return Response.redirect(
      "https://github.com/PawnHubChess/backend/wiki",
      302,
    );
  }
  const { socket: ws, response } = Deno.upgradeWebSocket(req);

  ws.onopen = () => handleConnected(ws, new URL(req.url));
  ws.onmessage = (m) => wsHandlers.handleMessage(ws, m.data);
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
  } else if (url.pathname === "/host") {
    await handleNewlyConnected(ws, true);
  } else {
    if (!handleCheckConnectParamsValid(ws, url)) return;
    const id = await handleNewlyConnected(ws, false);
    amqpHandlers.handleSendConnectRequest(
      id,
      url.searchParams.get("id")!,
      url.searchParams.get("code")!,
    );
  }
}

function handleCheckConnectParamsValid(ws: WebSocket, url: URL) {
  const id = url.searchParams.get("id");
  const code = url.searchParams.get("code");
  if (!id || !code) {
    ws.send(JSON.stringify({
      type: "error",
      error: "missing-connect-params",
    }));
    ws.close();
    return false;
  }
  return true;
}

async function handleNewlyConnected(ws: WebSocket, isHost: boolean) {
  const id = await wsi.connected(ws, isHost);
  const reconnectCode = await generateReconnectCode(id);

  wsi.sendMessageToId(id, {
    type: "connected",
    host: isHost,
    id: id,
    reconnectCode: reconnectCode,
  });

  amqp.createAndSubscribeToIdQueue(
    id,
    (message) => amqpHandlers.handleMessage(id, message),
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
    wsi.connected(ws, false, id);
    wsi.sendMessageToId(id, {
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

function handleDisconnect(ws: WebSocket) {
  const id = wsi.getId(ws);
  if (!id) return;
  startReconnectTransaction(id);
}

export function handleFinalDisconnect(id: string) {
  wsi.disconnected(id);
  amqp.destroyQueue(id);
}

if (isPortAvailableSync({ port: 3000 })) {
  serve(reqHandler, { port: 3000 });
}
