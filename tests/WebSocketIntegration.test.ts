import { delay } from "https://deno.land/std@0.160.0/async/delay.ts";
import { deadline } from "https://deno.land/std@0.160.0/async/mod.ts";
import { assertExists } from "https://deno.land/std@0.160.0/testing/asserts.ts";
import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";
import "../server.ts";
import { findGameById } from "../serverstate.ts";
import { uuid_regex } from "./TestHelper.test.ts";

function wsOpenPromise(ws: WebSocket) {
  return new Promise<void>((resolve) => {
    ws.onopen = () => {
      resolve();
    };
  });
}

function wsMessagePromise(ws: WebSocket) {
  return new Promise<any>((resolve) => {
    ws.onmessage = (msg: MessageEvent) => {
      resolve(JSON.parse(msg.data));
    };
  });
}

Deno.test("connect host websocket to localhost", async () => {
  const timeout = setTimeout(() => {
    throw new Error("timeout");
  }, 5000);

  const ws = new WebSocket("ws://localhost:3000");

  await wsOpenPromise(ws);
  ws.send(JSON.stringify({ type: "connect-host" }));
  const response = await wsMessagePromise(ws);

  assertEquals(response.type, "connected-id");
  assertMatch(response.id, /^0\d{3}$/);
  assertMatch(response["reconnect-code"], uuid_regex);

  // Send a disconnect message.
  // Otherwise, a reconnect timeout is created and the test will fail from leaking async ops.
  ws.send(JSON.stringify({ type: "disconnect" }));
  ws.close();
  clearTimeout(timeout);
});

async function matchClients(hostWs: WebSocket, attendeeWs: WebSocket) {
  hostWs.send(JSON.stringify({ type: "connect-host" }));
  const hostId = (await wsMessagePromise(hostWs)).id;

  attendeeWs.send(
    JSON.stringify({ type: "connect-attendee", host: hostId, code: "1234" }),
  );
  const clientId = (await wsMessagePromise(hostWs)).clientId;

  hostWs.send(
    JSON.stringify({ type: "accept-attendee-request", clientId: clientId }),
  );
  const hostResponse = await wsMessagePromise(hostWs);
  return { response: hostResponse, hostId: hostId };
}

Deno.test("match two websockets on localhost", async () => {
  const timeout = setTimeout(() => {
    throw new Error("timeout");
  }, 5000);

  const hostWs = new WebSocket("ws://localhost:3000");
  const attendeeWs = new WebSocket("ws://localhost:3000");
  await Promise.all([wsOpenPromise(hostWs), wsOpenPromise(attendeeWs)]);

  const { response, hostId } = await matchClients(hostWs, attendeeWs);

  assertEquals(response.type, "matched");

  const game = findGameById(hostId);
  assertExists(game?.hostWs);
  assertExists(game?.attendeeWs);

  // Send a disconnect message, see above
  hostWs.send(JSON.stringify({ type: "disconnect" }));
  hostWs.close();
  attendeeWs.close();
  clearTimeout(timeout);
});

Deno.test("relay moves on localhost", async () => {
  const timeout = setTimeout(() => {
    throw new Error("timeout");
  }, 5000);

  const hostWs = new WebSocket("ws://localhost:3000");
  const attendeeWs = new WebSocket("ws://localhost:3000");
  await Promise.all([wsOpenPromise(hostWs), wsOpenPromise(attendeeWs)]);
  await matchClients(hostWs, attendeeWs);

  attendeeWs.send(JSON.stringify({ type: "send-move", from: "A2", to: "A4" }));
  const hostMessage = await wsMessagePromise(hostWs);

  assertEquals(hostMessage.type, "receive-move");
  assertEquals(hostMessage.from, "A2");
  assertEquals(hostMessage.to, "A4");

  // Send a disconnect message, see above
  hostWs.send(JSON.stringify({ type: "disconnect" }));
  hostWs.close();
  attendeeWs.close();
  clearTimeout(timeout);
});
