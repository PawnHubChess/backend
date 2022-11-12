const ws = new WebSocket(/*"ws://localhost:3000"*/ "wss://api.pawn-hub.de");

ws.onopen = () => {
  ws.send(JSON.stringify({
    "type": "connect-host",
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);

  switch (data.type) {
    case "connected-id":
      gotConnectedMsg(data);
      break;
    case "verify-attendee-request":
      gotVerifyMsg(data);
      break;
    case "receive-move":
      gotMoveMsg(data);
      break;
  }
};

function gotConnectedMsg(data: any) {
  const id = data.id;
  console.log(`Connected host as ${id}`);
}

function gotVerifyMsg(data: any) {
  const id = data.clientId;
  const code = data.code;
  console.log(`Verifying  request from ${id} with code ${code}`);
  ws.send(JSON.stringify({
    type: "accept-attendee-request",
    clientId: id,
  }));
}

const alphabet = "ABCDEFGH";
let movesMade = 0;

function gotMoveMsg(data: any) {
  const from = data.from;
  const to = data.to;
  console.log(`Received move from ${from} to ${to}`);

  console.log(
    `Requesting to move from ${alphabet.charAt(movesMade)}7 to ${
      alphabet.charAt(movesMade)
    }5`,
  );
  ws.send(JSON.stringify({
    type: "send-move",
    from: `${alphabet.charAt(movesMade)}7`,
    to: `${alphabet.charAt(movesMade)}5`,
  }));

  if (movesMade++ >= 7) disconnect();
}

function disconnect() {
  ws.send(JSON.stringify({
    type: "disconnect",
  }));
  ws.close();
}
