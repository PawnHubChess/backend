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