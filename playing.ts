export function handleMakeMove(ws: WebSocket, from: string, to: string) {
  //@ts-ignore Custom property added to the websocket
  const game = findGameById(ws.id)!;

  // todo parse board position
  if (!game.validateMove(from, to)) {
    ws.send(JSON.stringify({
      "type": "reject-move",
      "from": from,
      "to": to,
    }));
    return;
  }

  ws.send(JSON.stringify({
    "type": "accept-move",
    "from": from,
    "to": to,
  }));
  
  //@ts-ignore Custom property added to the websocket
  game.relayMove(ws.id, from, to);
  checkGameWon();
}

function checkGameWon() {
}

function handleGameWon() {
}
