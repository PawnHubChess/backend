import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { AmqpChannel, AmqpConnect } from "./deps.ts";

let channel: AmqpChannel | undefined = undefined;
let pendingPromise: Promise<AmqpChannel> | undefined = undefined;

export function getChannel(): Promise<AmqpChannel> {
  if (channel) return new Promise((resolve) => resolve(channel!));
  if (pendingPromise) return pendingPromise;

  pendingPromise = openChannel();
  console.log("channel gotten");
  return pendingPromise;
}

function openChannel(): Promise<AmqpChannel> {
  // deno-lint-ignore no-async-promise-executor
  return new Promise<AmqpChannel>(
    async (resolve, reject) => {
      try {
        const connection = await AmqpConnect(Deno.env.get("CLOUDAMQP_URL")!);
        channel = await connection.openChannel();
        resolve(channel);
      } catch (error) {
        reject(error);
      }
    },
  );
}
