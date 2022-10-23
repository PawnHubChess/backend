import { uuid } from "./deps.ts";
import { gameExists } from "./serverstate.ts";

export function generateHostId(): string {
  let id: string;
  do {
    id = Math.floor(Math.random() * 998 + 1)
      .toString().padStart(4, "0");
  } while (gameExists(id));

  return id;
}

export function generateAttendeeId(): string {
  return uuid.generate() as string;
}