import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.160.0/testing/asserts.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  Spy,
  spy,
} from "https://deno.land/std@0.165.0/testing/mock.ts";
import { ExtendedWs } from "../ExtendedWs.ts";
import { handleMessage } from "../server.ts";

const getWsStub = (send: Spy) => {
  const stub = { readyState: 1 } as unknown as ExtendedWs;
  stub.send = send;
  return stub;
};
const uuid_regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

Deno.test("host gets correct id and reconnectcode", () => {
  const sendSpy = spy();
  const wsStub = getWsStub(sendSpy);

  handleMessage(wsStub, { type: "connect-host" });

  assertSpyCalls(sendSpy, 1);
  const calledData = JSON.parse(sendSpy.calls[0].args[0]);

  assertEquals(calledData.type, "connected-id");
  assert(calledData.id.match(/^0\d{3}$/));
  assert(calledData["reconnect-code"].match(uuid_regex));
});

Deno.test("connect attendee without code declined", () => {
  const sendSpy = spy();
  const wsStub = getWsStub(sendSpy);

  handleMessage(wsStub, { type: "connect-attendee" });

  assertSpyCalls(sendSpy, 1);
  assert(sendSpy.calls[0].args[0].match(/request-declined/));
});
