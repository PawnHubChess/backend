import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";
import {
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.165.0/testing/mock.ts";
import "../server.ts";
import { assertAttr, uuid_regex } from "./TestHelper.test.ts";

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
});
