import { ConnectRequest } from "./connectrequest.ts";
import { ExtendedWs } from "./ExtendedWs.ts";
import { Game } from "./Game.ts";

const games: Array<Game> = [];

export function createGame(selfId: string, opponentId: string): Game {
  const game = new Game(selfId, opponentId);
  games.push(game);
  return game;
}

export function getGameById(id: string): Game | undefined {
  return games.find((game) => game.selfId === id || game.opponentId === id);
}

export function gameExists(hostId: string): boolean {
  return typeof findGameById(hostId) !== "undefined";
}

export function selfInGame(ownId: string): boolean {
  return games.find((game) => game.selfId === ownId) !== undefined;
}

export function closeGameByHostId(id: string) {
  //const index = games.findIndex((game) => game.self == id);
  // todo
  //games[index].hostWs.close();
  //games[index].attendeeWs?.close();
  //games.splice(index, 1);
}

export function resetGameByAttendeeId(id: string) {
  //const index = games.findIndex((game) => game.attendeeId === id);
  //if (index === -1) return;
  // todo
  //games[index].attendeeWs?.close();
  //games[index] = new Game(games[index].hostId, games[index].hostWs);
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
