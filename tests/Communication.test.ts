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

const getStubAndSpy = () => {
  const ws = { readyState: 1 } as unknown as ExtendedWs;
  const send = spy();
  ws.send = send;
  return { stub: ws, spy: send };
};
const uuid_regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

Deno.test("host gets correct id and reconnectcode", () => {
  const { stub, spy } = getStubAndSpy();

  handleMessage(stub, { type: "connect-host" });

  assertSpyCalls(spy, 1);
  const calledData = JSON.parse(spy.calls[0].args[0]);

  assertEquals(calledData.type, "connected-id");
  assert(calledData.id.match(/^0\d{3}$/));
  assert(calledData["reconnect-code"].match(uuid_regex));
});

Deno.test("connect attendee without code declined", () => {
  const { stub, spy } = getStubAndSpy();

  handleMessage(stub, { type: "connect-attendee" });

  assertSpyCalls(spy, 1);
  assert(spy.calls[0].args[0].match(/request-declined/));
});

Deno.test("connect attendee nonexitent host declined", () => {
  const { stub, spy } = getStubAndSpy();

  handleMessage(stub, { type: "connect-attendee", host: "01234", code: "1234" });

  assertSpyCalls(spy, 1);
  assert(spy.calls[0].args[0].match(/request-declined/));
});
