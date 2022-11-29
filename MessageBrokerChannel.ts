import { AmqpChannel, connect } from "https://deno.land/x/amqp@v0.21.0/mod.ts";

let channel: AmqpChannel | undefined = undefined;
let pendingPromise: Promise<AmqpChannel> | undefined = undefined;

export function getChannel(): Promise<AmqpChannel> {
  if (channel) return new Promise((resolve) => resolve(channel!));
  if (pendingPromise) return pendingPromise;

  pendingPromise = openChannel();
  return pendingPromise;
}

function openChannel(): Promise<AmqpChannel> {
  // deno-lint-ignore no-async-promise-executor
  return new Promise<AmqpChannel>(
    async (resolve, reject) => {
      try {
        const connection = await connect(Deno.env.get("CLOUDAMQP_URL")!);
        channel = await connection.openChannel();
        resolve(channel);
      } catch (error) {
        reject(error);
      }
    },
  );
}
