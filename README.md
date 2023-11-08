# Chess:E Backend
The Chess:E backend connects our [physical chess board](https://github.com/PawnHubChess/client-board) and [web client](https://github.com/PawnHubChess/client-web), so users can play against each other.
Clients communicate via a WebSocket connection with the backend, which handles game logic and stores the game state (though currently not persisted). Clients don't have to be connected to the same backend instance, multiple backend instances communicate via a message broker (LavinMQ).

[![View Docs](https://img.shields.io/badge/View-Docs-c175ff)](https://api.chesse.koeni.dev)
[![View on CODE Learning Platform](https://img.shields.io/badge/View_on-CODE_Learning_Platform-1e2022)](https://app.code.berlin/projects/cl7ah7xam785660wl8xssnw4ja)
[![Deno Tests](https://github.com/PawnHubChess/backend/actions/workflows/deno.yml/badge.svg)](https://github.com/PawnHubChess/backend/actions/workflows/deno.yml)

Read the wiki at <https://api.chesse.koeni.dev> or
connect using a WebSocket to wss://api.chesse.koeni.dev.

## Chess:E Project Structure

This diagram is a bit outdated but can serve as a general overview ;)

![image](https://user-images.githubusercontent.com/32238636/202461111-94ce45ba-ff0e-4da6-9200-8476bb357f72.png)
You are here: Bottom center (backend) / GitHub: backend / Version Control

## Backend Architecture

![architecture diagram](_docs_assets/architecture.drawio.svg)

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
The deployment configured in the `cloudbuild.yaml` file, so the project can also be deployed using `gcloud run deploy`.

---

![chess bot](https://github.com/PawnHubChess/backend/assets/32238636/e9307f03-cf54-4dc7-a454-ba7c27262bcd)