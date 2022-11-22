import { ConnectRequest } from "./connectrequest.ts";
import { ExtendedWs } from "./ExtendedWs.ts";
import { Game } from "./Game.ts";

const games: Array<Game> = [];

export function createHost(hostId: string, ws: ExtendedWs) {
  if (gameExists(hostId)) {
    throw new Error("Host already exists");
  }

  games.push(new Game(hostId, ws));
}

export function findGameByHostid(id: string): Game | undefined {
  return games.find((game) => game.hostId === id);
}

export function findGameByAttendeeId(id: string): Game | undefined {
  return games.find((game) => game.attendeeId === id);
}

export function findGameById(id: string): Game | undefined {
  return games.find((game) => game.hostId === id || game.attendeeId === id);
}

export function gameExists(hostId: string): boolean {
  return typeof findGameByHostid(hostId) !== "undefined";
}

export function findWsById(id: string): ExtendedWs | undefined {
  const game = findGameById(id);
  if (!game) return;

  if (game.hostWs.id === id) return game.hostWs;
  else if (game.attendeeWs?.id === id) return game.attendeeWs;
  else return;
}

function addAttendeeToGame(
  hostId: string,
  attendeeId: string,
  ws: ExtendedWs,
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
  const index = games.findIndex((game) => game.hostId == id);
  games[index].hostWs.close()
  games.splice(index, 1);
}

export function resetGameByAttendeeId(id: string) {
  const index = games.findIndex((game) => game.attendeeId === id);
  if (index === -1) return;
  games[index].attendeeWs?.close();
  games[index] = new Game(games[index].hostId, games[index].hostWs);
}

const pendingConnectRequests: Array<ConnectRequest> = [];

export function createConnectRequest(
  attendeeId: string,
  connectTo: string,
  ws: ExtendedWs,
) {
  if (findConnectRequestByAttendeeId(attendeeId) !== undefined) {
    throw new Error("Attendee already has a connect request");
  }
  const request = new ConnectRequest(attendeeId, connectTo, ws);
  pendingConnectRequests.push(request);
}

export function findConnectRequestByAttendeeId(
  attendeeId: string,
): ConnectRequest | undefined {
  return pendingConnectRequests.find((request) =>
    request.attendeeId === attendeeId
  );
}

export function attendeeHostMatch(attendeeId: string, hostId: string): boolean {
  const request = findConnectRequestByAttendeeId(attendeeId);
  if (!request) {
    return false;
  }

  return request.connectTo === hostId;
}

export function acceptConnectRequest(attendeeId: string): Game | null {
  const request = findConnectRequestByAttendeeId(attendeeId);
  if (!request) {
    return null;
  }

  const game = addAttendeeToGame(
    request.connectTo,
    request.attendeeId,
    request.ws,
  );

  removeAttendeeFromArray(attendeeId);

  return game;
}

export function declineAttendeeRequest(attendeeId: string): ExtendedWs | null {
  const request = findConnectRequestByAttendeeId(attendeeId);
  if (!request) {
    return null;
  }
  const ws = request.ws;

  removeAttendeeFromArray(attendeeId);

  return ws;
}

function removeAttendeeFromArray(attendeeId: string) {
  pendingConnectRequests.splice(
    pendingConnectRequests.findIndex((request) =>
      request.attendeeId === attendeeId
    ),
    1,
  );
}
