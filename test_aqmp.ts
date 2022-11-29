import {
  createQueue,
  destroyQueue,
  publish,
  subscribe,
} from "./MessageBrokerInterface.ts";

console.log("Starting");

const exchangeName = "host_client-1";

await createQueue(exchangeName);

await subscribe(exchangeName, (message: any) => {
  console.log(message);
});

await publish(exchangeName, { "receive-move": "abcdef" });

setTimeout(async () => {
    await destroyQueue(exchangeName);
    console.log("Destroyed queue after 5 seconds");
    Deno.exit()
}, 5000);
