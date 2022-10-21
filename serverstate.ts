import { ConnectRequest } from "./connectrequest.ts";
import { Game } from "./Game.ts";

const games: Array<Game> = [];

export function createHost(hostId: string, ws: WebSocket) {
  if (gameExists(hostId)) {
    throw new Error("Host already exists");
  }

  games.push(new Game(hostId, ws));
}

export function findGameByHostid(id: string): Game | undefined {
  return games.find(game => game.hostId === id);
}

export function findGameByAttendeeId(id: string): Game | undefined {
  return games.find(game => game.attendeeId === id);
}

export function gameExists(hostId: string): boolean {
  return typeof findGameByHostid(hostId) !== "undefined";
}

function addAttendeeToGame(
  hostId: string,
  attendeeId: string,
  ws: WebSocket,
): Game {
  const game = findGameByHostid(hostId);
  if (!game) {
    throw new Error("Game does not exist");
  }

  game.attendeeId = attendeeId;
  game.attendeeWs = ws;

  return game;
}

export function closeGameByHostId(id: string) {
  console.log(games)
  games.splice(games.findIndex(game => game.hostId == id), 1);
  console.log(games)
}

export function removeAttendeeFromGame(id: string) {
  const game = findGameByAttendeeId(id)
  if (!game) return
  game.attendeeId = undefined
  game.attendeeWs = undefined

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
