# `@transcendence/game-shared`

Code partagé entre le serveur Colyseus (`apps/game/server`) et le client Babylon (`apps/game/client`). **Source unique de vérité** pour le protocole réseau et les types échangés sur le fil.

## Pourquoi un package partagé

Sans ce package, le nom de la room (`"game"`), les noms de messages (`"input"`) et la forme des payloads (`InputCommand`) seraient dupliqués des deux côtés. La moindre faute de frappe ou désynchronisation entre back et front produirait un bug runtime silencieux.

Avec ce package : un seul endroit à modifier, deux consommateurs typés, **0 string magique**.

## Contenu (branche `feat/core-architecture`)

```
src/
├── index.ts              # Barrel — point d'entrée public
├── protocol.ts           # Constantes du protocole (ROOM_NAME, ClientMessage)
└── types/
    ├── index.ts          # Barrel des types
    ├── messages.ts       # Payloads client→serveur (InputCommand)
    └── state.ts          # Vue read-only de l'état synchronisé (PlayerStateView)
```

## Règles d'or

1. **Aucune dépendance runtime.** Ce package ne dépend pas de Colyseus, Babylon, ou Bun. Juste des types et constantes. Cela garantit qu'il reste consommable depuis n'importe quel runtime.
2. **Tout export doit être documenté en TSDoc.** C'est le contrat réseau — les autres devs doivent comprendre sans lire l'implémentation.
3. **Pas de logique métier ici.** Schémas Colyseus → serveur. Rendering Babylon → client. Ce package = **contrat** uniquement.
4. **Ajouter un message = 3 étapes obligatoires** :
   1. Ajouter le nom dans `ClientMessage` (`protocol.ts`).
   2. Ajouter l'interface de payload dans `types/messages.ts`.
   3. Ré-exporter depuis `types/index.ts` et `index.ts`.

## Consommer ce package

Les apps `client` et `server` le déclarent via :

```json
"dependencies": {
  "@transcendence/game-shared": "file:../shared-package"
}
```

Import recommandé (préfère le chemin racine pour rester insensible aux réorganisations internes) :

```ts
import { ROOM_NAME, ClientMessage, type InputCommand } from '@transcendence/game-shared';
```

## Scripts

```bash
bun install               # installe les dev-deps
bun run test              # lance vitest (aucun test pour l'instant)
bun run format            # prettier --write
```
