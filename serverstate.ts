import { Game } from "./game.ts";

const games: Array<Game> = [];

export function createHost(hostId: string, ws: WebSocket) {
  games.push(new Game(hostId, ws));
}