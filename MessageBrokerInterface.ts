import { getChannel } from "./MessageBrokerChannel.ts";
export async function subscribe(
  queue: string,
  callback: (message: any) => void,
): Promise<void> {
  const channel = await getChannel();

  await channel.consume(
    { queue: queue },
    async (args, _, data) => {
      const json = JSON.parse(new TextDecoder().decode(data));
      callback(json);
      await channel.ack({ deliveryTag: args.deliveryTag });
    },
  );
}
