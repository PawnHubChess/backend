import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.160.0/testing/asserts.ts";
import {
  assertSpyCalls,
  Spy,
  spy,
} from "https://deno.land/std@0.165.0/testing/mock.ts";
import { ExtendedWs } from "../ExtendedWs.ts";
import { handleMessage } from "../server.ts";
import { findGameById } from "../serverstate.ts";

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
  assertMatch(calledData.id, /^0\d{3}$/);
  assertMatch(calledData["reconnect-code"], uuid_regex);
});

Deno.test("connect attendee without code declined", () => {
  const { stub, spy } = getStubAndSpy();

  handleMessage(stub, { type: "connect-attendee" });

  assertSpyCalls(spy, 1);
  assertMatch(spy.calls[0].args[0], /request-declined/);
});

Deno.test("connect attendee nonexitent host declined", () => {
  const { stub, spy } = getStubAndSpy();

  handleMessage(stub, {
    type: "connect-attendee",
    host: "01234",
    code: "1234",
  });

  assertSpyCalls(spy, 1);
  assertMatch(spy.calls[0].args[0], /request-declined/);
});

//
// Two-Way Communication
//

function getHostId(hostStub: ExtendedWs, hostSpy: Spy): string {
  handleMessage(hostStub, { type: "connect-host" });
  assertSpyCalls(hostSpy, 1);
  return JSON.parse(hostSpy.calls[0].args[0]).id;
}

function sendAttendeeConnectionRequest(
  attendeeStub: ExtendedWs,
  hostId: string,
) {
  handleMessage(attendeeStub, {
    type: "connect-attendee",
    host: hostId,
    code: "1234",
  });
}

function establishConnection(
  hostStub: ExtendedWs,
  hostSpy: Spy,
  attendeeStub: ExtendedWs,
) {
  const hostId = getHostId(hostStub, hostSpy);
  sendAttendeeConnectionRequest(attendeeStub, hostId);

  assertSpyCalls(hostSpy, 2);
  const request = JSON.parse(hostSpy.calls[1].args[0]);
  handleMessage(hostStub, {
    type: "accept-attendee-request",
    clientId: request.clientId,
  });

  return hostId;
}

Deno.test("connection request sent to host", () => {
  const { stub: hostStub, spy: hostSpy } = getStubAndSpy();
  const { stub: attendeeStub } = getStubAndSpy();

  const hostId = getHostId(hostStub, hostSpy);
  sendAttendeeConnectionRequest(attendeeStub, hostId);

  assertSpyCalls(hostSpy, 2);
  assertMatch(hostSpy.calls[1].args[0], /verify-attendee-request/);
});

Deno.test("decline connection request", () => {
  const { stub: hostStub, spy: hostSpy } = getStubAndSpy();
  const { stub: attendeeStub, spy: attendeeSpy } = getStubAndSpy();

  const hostId = getHostId(hostStub, hostSpy);
  sendAttendeeConnectionRequest(attendeeStub, hostId);

  assertSpyCalls(hostSpy, 2);
  const request = JSON.parse(hostSpy.calls[1].args[0]);
  handleMessage(hostStub, {
    type: "decline-attendee-request",
    clientId: request.clientId,
  });

  assertSpyCalls(attendeeSpy, 1);
  assertMatch(attendeeSpy.calls[0].args[0], /request-declined/);
});

Deno.test("accept connection request", () => {
  const { stub: hostStub, spy: hostSpy } = getStubAndSpy();
  const { stub: attendeeStub, spy: attendeeSpy } = getStubAndSpy();

  establishConnection(hostStub, hostSpy, attendeeStub);

  assertSpyCalls(hostSpy, 3);
  assertMatch(hostSpy.calls[2].args[0], /matched/);

  assertSpyCalls(attendeeSpy, 2);
  // Attendee: connected-id message
  const attendeeConnectedData = JSON.parse(attendeeSpy.calls[0].args[0]);
  assertEquals(attendeeConnectedData.type, "connected-id");
  assertMatch(attendeeConnectedData.id, uuid_regex);
  assertMatch(attendeeConnectedData["reconnect-code"], uuid_regex);
  // Attendee: matched message
  assertMatch(attendeeSpy.calls[1].args[0], /matched/);
});

Deno.test("relay move", () => {
  const { stub: hostStub, spy: hostSpy } = getStubAndSpy();
  const { stub: attendeeStub, spy: attendeeSpy } = getStubAndSpy();

  establishConnection(hostStub, hostSpy, attendeeStub);

  // Reset spy calls
  hostSpy.calls.length = 0;
  attendeeSpy.calls.length = 0;

  handleMessage(attendeeStub, {
    type: "send-move",
    from: "A2",
    to: "A4",
  });

  assertSpyCalls(attendeeSpy, 1);
  assertMatch(attendeeSpy.calls[0].args[0], /accept-move/);

  assertSpyCalls(hostSpy, 1);
  const hostMoveData = JSON.parse(hostSpy.calls[0].args[0]);
  assertEquals(hostMoveData.type, "receive-move");
  assertEquals(hostMoveData.from, "A2");
  assertEquals(hostMoveData.to, "A4");
  assertEquals(
    hostMoveData.fen,
    "rnbqkbnr/pppppppp/8/8/P7/8/1PPPPPPP/RNBQKBNR b",
  );
});

Deno.test("reject invalid move", () => {
  const { stub: hostStub, spy: hostSpy } = getStubAndSpy();
  const { stub: attendeeStub, spy: attendeeSpy } = getStubAndSpy();

  establishConnection(hostStub, hostSpy, attendeeStub);

  attendeeSpy.calls.length = 0;
  handleMessage(attendeeStub, {
    type: "send-move",
    from: "A7",
    to: "A6",
  });

  assertSpyCalls(attendeeSpy, 1);
  assertMatch(attendeeSpy.calls[0].args[0], /reject-move/);
});

Deno.test("reject first move by host", () => {
  const { stub: hostStub, spy: hostSpy } = getStubAndSpy();
  const { stub: attendeeStub } = getStubAndSpy();

  establishConnection(hostStub, hostSpy, attendeeStub);

  hostSpy.calls.length = 0;
  handleMessage(hostStub, {
    type: "send-move",
    from: "A7",
    to: "A6",
  });

  assertSpyCalls(hostSpy, 1);
  assertMatch(hostSpy.calls[0].args[0], /reject-move/);
});

Deno.test("relay move two way", () => {
  const { stub: hostStub, spy: hostSpy } = getStubAndSpy();
  const { stub: attendeeStub, spy: attendeeSpy } = getStubAndSpy();
  establishConnection(hostStub, hostSpy, attendeeStub);
  handleMessage(attendeeStub, {
    type: "send-move",
    from: "A2",
    to: "A4",
  });

  hostSpy.calls.length = 0;
  attendeeSpy.calls.length = 0;

  handleMessage(hostStub, {
    type: "send-move",
    from: "A7",
    to: "A5",
  });

  assertSpyCalls(hostSpy, 1);
  assertMatch(hostSpy.calls[0].args[0], /accept-move/);

  assertSpyCalls(attendeeSpy, 1);
  const attendeeMoveData = JSON.parse(attendeeSpy.calls[0].args[0]);
  assertEquals(attendeeMoveData.type, "receive-move");
  assertEquals(attendeeMoveData.from, "A7");
  assertEquals(attendeeMoveData.to, "A5");
  assertEquals(
    attendeeMoveData.fen,
    "rnbqkbnr/1ppppppp/8/p7/P7/8/1PPPPPPP/RNBQKBNR w",
  );
});

Deno.test("get fen", () => {
  const { stub: hostStub, spy: hostSpy } = getStubAndSpy();
  const { stub: attendeeStub, spy: attendeeSpy } = getStubAndSpy();
  establishConnection(hostStub, hostSpy, attendeeStub);
  handleMessage(attendeeStub, {
    type: "send-move",
    from: "A2",
    to: "A4",
  });
  handleMessage(hostStub, {
    type: "send-move",
    from: "B7",
    to: "B5",
  });
  handleMessage(attendeeStub, {
    type: "send-move",
    from: "A4",
    to: "B5",
  });

  attendeeSpy.calls.length = 0;

  handleMessage(attendeeStub, { type: "get-board" });

  assertSpyCalls(attendeeSpy, 1);
  const attendeeMoveData = JSON.parse(attendeeSpy.calls[0].args[0]);
  assertEquals(attendeeMoveData.type, "board");
  assertEquals(
    attendeeMoveData.fen,
    "rnbqkbnr/p1pppppp/8/1P6/8/8/1PPPPPPP/RNBQKBNR b",
  );
});

Deno.test("disconnect host", () => {
  const { stub: hostStub, spy: hostSpy } = getStubAndSpy();
  const { stub: attendeeStub, spy: attendeeSpy } = getStubAndSpy();
  const hostId = establishConnection(hostStub, hostSpy, attendeeStub);

  attendeeSpy.calls.length = 0;

  handleMessage(hostStub, { type: "disconnect" });

  assertSpyCalls(attendeeSpy, 1);
  assertMatch(attendeeSpy.calls[0].args[0], /opponent-disconnected/);

  assertEquals(findGameById(hostId), undefined);
});
