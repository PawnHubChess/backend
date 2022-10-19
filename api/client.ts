function handleError(e: Event | ErrorEvent) {
  console.log(e instanceof ErrorEvent ? e.message : e.type);
}

console.log("Connecting to server ...");
try {
  const ws = new WebSocket("ws://localhost:3000/");
  ws.onopen = () => {
    console.log("ws connected!");
    ws.send("something");

  };
  ws.onmessage = (message) => {
    console.log(message.data);
  };
  ws.onclose = () => console.log("Disconnected from server ...");
  ws.onerror = (e) => handleError(e);
} catch (err) {
  console.log("Failed to connect to server ... exiting" + err);
}
