# PawnHub Backend
Connecting the [physical chess board](https://github.com/PawnHubChess/client-board) to [our web client](https://github.com/PawnHubChess/client-web).

[![View on - CODE Learning Platform](https://img.shields.io/badge/View_on-CODE_Learning_Platform-1e2022)](https://app.code.berlin/projects/cl7ah7xam785660wl8xssnw4ja)
[![Deno Tests](https://github.com/PawnHubChess/backend/actions/workflows/deno.yml/badge.svg)](https://github.com/PawnHubChess/backend/actions/workflows/deno.yml)

Read the wiki at https://api.pawn-hub.de or
connect using a WebSocket to wss://api.pawn-hub.de.

## Project Structure
![image](https://user-images.githubusercontent.com/32238636/202461111-94ce45ba-ff0e-4da6-9200-8476bb357f72.png)
You are here: Bottom center (backend) / GitHub: backend / Version Control

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
