import { wsHandlers, wsi } from "./deps_int.ts";
import { Game } from "./Game.ts";

const games: Array<Game> = [];

export function createGame(selfId: string, opponentId: string): Game {
  const game = new Game(selfId, opponentId);
  games.push(game);
  return game;
}

export function getGameById(id: string): Game | undefined {
  return games.find((game) => game.selfId === id);
}

export function selfInGame(ownId: string): boolean {
  return games.find((game) => game.selfId === ownId) !== undefined;
}

export function removeGame(ownId: string) {
  const index = games.findIndex((game) => game.selfId === ownId);
  if (index !== -1) games.splice(index, 1);
}

const pendingConnectRequests = new Map<string, string>();

export function createConnectRequest(
  ownId: string,
  opponentId: string
) {
  pendingConnectRequests.set(ownId, opponentId);
  startConnectRequestTimeout(ownId);
}

export function connectRequestMatches(ownId: string, opponentId: string) {
  return pendingConnectRequests.get(ownId) === opponentId;
}

export function removeConnectRequest(ownId: string) {
  pendingConnectRequests.delete(ownId);
}

export function existsConnectRequest(id: string) {
  return pendingConnectRequests.has(id);
}

function startConnectRequestTimeout(id: string) {
  // Connection requests timeout after 20 seconds
  setTimeout(() => {
    if (pendingConnectRequests.has(id)) {
      wsHandlers.handleSendTimeoutMessage(id);
      wsi.close(id);
    }
  }, 10_000);
}
