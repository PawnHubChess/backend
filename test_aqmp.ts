import { connect } from "https://deno.land/x/amqp@v0.21.0/mod.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const connection = await connect(Deno.env.get("CLOUDAMQP_URL")!);
const channel = await connection.openChannel();

const exchangeName = "host_client";
await channel.declareQueue({ queue: exchangeName });

await channel.consume({ queue: exchangeName }, async (args, props, data) => {
  console.log(JSON.stringify(args));
  console.log(JSON.stringify(props));
  console.log(new TextDecoder().decode(data));
  await channel.ack({ deliveryTag: args.deliveryTag });
});

await channel.publish(
  { routingKey: exchangeName },
  { contentType: "application/json" },
  new TextEncoder().encode(JSON.stringify({ foo: "bar" })),
);

console.log("Done");
