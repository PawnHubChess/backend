import { ConnectRequest } from "./connectrequest.ts";
import { Game } from "./game.ts";

const games: Array<Game> = [];

export function createHost(hostId: string, ws: WebSocket) {
  if (gameExists(hostId)) {
    throw new Error("Host already exists");
  }

  games.push(new Game(hostId, ws));
}

export function getGameByHostid(id: string): Game | null {
  return games.filter((game) => game.hostId === id)[0] || null;
}

export function gameExists(hostId: string): boolean {
  return getGameByHostid(hostId) !== null;
}

function addAttendeeToGame(
  hostId: string,
  attendeeId: string,
  ws: WebSocket,
): Game {
  const game = getGameByHostid(hostId);
  if (!game) {
    throw new Error("Game does not exist");
  }

  game.attendeeId = attendeeId;
  game.attendeeWs = ws;

  return game;
}

const pendingConnectRequests: Array<ConnectRequest> = [];

export function createConnectRequest(
  attendeeId: string,
  connectTo: string,
  ws: WebSocket,
) {
  const request = new ConnectRequest(attendeeId, connectTo, ws);
  pendingConnectRequests.push(request);
}

export function getConnectRequestByAttendeeId(
  attendeeId: string,
): ConnectRequest | null {
  return pendingConnectRequests.filter((request) =>
    request.attendeeId === attendeeId
  )[0] || null;
}

export function attendeeHostMatch(attendeeId: string, hostId: string): boolean {
  const request = getConnectRequestByAttendeeId(attendeeId);
  if (!request) {
    return false;
  }

  return request.connectTo === hostId;
}

export function acceptConnectRequest(attendeeId: string): Game {
  const request = getConnectRequestByAttendeeId(attendeeId);
  if (!request) {
    throw new Error("Connect request does not exist");
  }

  const game = addAttendeeToGame(
    request.connectTo,
    request.attendeeId,
    request.ws,
  );
  return game;
}
