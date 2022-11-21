import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.160.0/testing/asserts.ts";
import {
  assertSpyCall,
  spy,
} from "https://deno.land/std@0.165.0/testing/mock.ts";
import { ExtendedWs } from "../ExtendedWs.ts";
import { handleMessage } from "../server.ts";

const uuid_regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

Deno.test("host gets correct id and reconnectcode", () => {
  let spyCalledWithMessage: string | undefined;

  const wsStub = { readyState: 1 } as unknown as ExtendedWs;
  const sendSpy = spy((msg: string) => {
    spyCalledWithMessage = msg;
  });
  wsStub.send = sendSpy;

  handleMessage(wsStub, { type: "connect-host" });

  // Cannot simply assert spy called with argument because the id and reconnectcode are random
  assertSpyCall(sendSpy, 0, {});
  const data = JSON.parse(spyCalledWithMessage!);
  assertEquals(data.type, "connected-id");
  assert(data.id.match(/^0\d{3}$/));
  assert(data["reconnect-code"].match(uuid_regex));
});
