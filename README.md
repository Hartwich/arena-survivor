# Open Party Lab: Arena Survivor

Arena Survivor is an Open Party Lab game package. Players pick characters on their phones, survive escalating enemy waves on the shared host screen, and spend collected material between waves.

## Local Development

Recommended folder layout:

```text
Open-Party-Lab/
  local-games/
    arena-survivor/
```

Install and build this game:

```bash
npm install
npm run typecheck
npm run build
```

For local Platform integration, run this in the Party Platform repo:

```bash
cd ../..
npm run games:sync-local
npm run dev:all
```

The Platform links only game repos that exist locally. If this repo is not present, Arena Survivor is skipped.

## Public Entrypoints

```text
@open-party-lab/game-arena-survivor/manifest
@open-party-lab/game-arena-survivor/protocol
@open-party-lab/game-arena-survivor/server
@open-party-lab/game-arena-survivor/host
@open-party-lab/game-arena-survivor/controller
```

## Browser Note

Chromium-based browsers and Safari are recommended for phone controllers. Firefox may have issues around fullscreen, reconnect/session handling, or touch timing.

