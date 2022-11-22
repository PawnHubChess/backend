# PawnHub Backend
Connecting the [physical chess board](https://github.com/PawnHubChess/client-board) to [our web client](https://github.com/PawnHubChess/client-web).

Read the wiki at https://api.pawn-hub.de.
Connect using a WebSocket to wss://api.pawn-hub.de.

## Running the backend locally
If you have not yet installed Deno, [follow their easy installation guide](https://github.com/denoland/deno/blob/main/README.md).
Then, simply execute:
```bash
deno run --allow-net server.ts
```

## Testing
Tests are located in the /tests/ directory. Run tests by using:
```bash
deno test --allow-net
```
Optionally specify a test file to run or filter tests. Tests in the `Communication.test.ts` file require the --allow-net flag.

## Deploying
Changes made on `main` are automatically deployed to Google Cloud Run. 
