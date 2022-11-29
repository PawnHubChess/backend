import { connect } from "https://deno.land/x/redis/mod.ts";

const redis = await connect({
  hostname: "redis-12583.c135.eu-central-1-1.ec2.cloud.redislabs.com",
  port: "12583",
  username: "default",
  password: "",
});

console.log("Connected")

const sub = await redis.subscribe("channel");
(async function () {
  for await (const { channel, message } of sub.receive()) {
    console.log(channel, message);
    console.log("Received message");
  }
})();

console.log("Subscribed")

console.log(await redis.publish("channel", "Hello World") + " messages published");

console.log("Published")