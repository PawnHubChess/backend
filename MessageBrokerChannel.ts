import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { AmqpChannel, AmqpConnect } from "./deps.ts";

let channel: AmqpChannel | undefined = undefined;
let pendingPromise: Promise<AmqpChannel> | undefined = undefined;

export function getChannel(): Promise<AmqpChannel> {
  // `fix: use a fresh amqp channel for every client`
  // This is worse for performance, but solves a weird bug where queues are not correctly declared if a channel has been used before.
  //if (channel) return new Promise((resolve) => resolve(channel!));
  //if (pendingPromise) return pendingPromise;

  pendingPromise = openChannel();
  return pendingPromise;
}

function openChannel(): Promise<AmqpChannel> {
  // deno-lint-ignore no-async-promise-executor
  return new Promise<AmqpChannel>(
    async (resolve, reject) => {
      try {
        const connection = await AmqpConnect(Deno.env.get("AMQP_URL")!);
        channel = await connection.openChannel();
        resolve(channel);
      } catch (error) {
        reject(error);
      }
    },
  );
}
