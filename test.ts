import { connect } from "https://deno.land/x/redis/mod.ts";

const subscriber = await connect({
  hostname: "redis-15929.c135.eu-central-1-1.ec2.cloud.redislabs.com",
  port: "15929",
  username: "backend",
  password: "",
});

const sub = await subscriber.subscribe("channel");
(async function () {
  for await (const { channel, message } of sub.receive()) {
    console.log(channel, message);
    console.log("Received message");
  }
})();



const publisher = await connect({
  hostname: "redis-15929.c135.eu-central-1-1.ec2.cloud.redislabs.com",
  port: "15929",
  username: "backend",
  password: "",
});

console.log(await publisher.publish("channel", "nice"));