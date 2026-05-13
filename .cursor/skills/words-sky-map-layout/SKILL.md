---
name: words-sky-map-layout
description: >-
  Words Sky vocabulary map layout and edges. Use when changing the React Flow
  map, topic word data, minimap, or how concepts are grouped on the canvas.
  Covers mapGroup, MAP_GROUP_ORDER, graph.ts placement, and translation-only
  edges.
disable-model-invocation: true
---

# Words Sky — Map layout skill

## Steps

1. **Classify the change** — topic data (`mapGroup`, tags), layout/spacing constants, React Flow / `TopicPage` behavior, or legend copy — then jump to the matching subsection below.
2. **Data** — ensure every touched [`TopicWord`](src/data/words.ts) has **`mapGroup`**; new bands extend **`MAP_GROUP_ORDER`** for that [`TopicSlug`](src/data/words.ts). Follow [.cursor/rules/words-sky-topic-data.mdc](../../rules/words-sky-topic-data.mdc) for **`false-friend-XX-YY`** and other tags.
3. **Layout code** — adjust [`src/lib/graph.ts`](src/lib/graph.ts), [`src/lib/clusterLayout.ts`](src/lib/clusterLayout.ts), [`src/lib/constants.ts`](src/lib/constants.ts) (`CLUSTER_GROUP_GAP_Y`, grid, orbit constants), and/or [`src/components/TopicPage.tsx`](src/components/TopicPage.tsx) per **Do / do not** (translation-only edges, no MiniMap).
4. **Verify** — run **`npm run build`**; if Study order could drift, confirm `getGuidedTopicWords` still matches the intended difficulty + `mapGroup` round-robin behavior.

## Mental model

- **Study** teaches one word at a time (Study card).
- **Map** is a visual overview: each **concept** is a small cluster with **one node per selected language** (your anchor plus the translation languages you picked on Landing; same subset as Study).
- **Lines on the map** mean only one thing: **same concept, different languages** (translation links). There are no “next word in list” edges.

## Data: `mapGroup` and `MAP_GROUP_ORDER`

- Every [`TopicWord`](src/data/words.ts) must have **`mapGroup: string`** (learner-meaningful band for that topic).
- [`MAP_GROUP_ORDER`](src/data/words.ts) defines the **vertical order of bands** on the map for each [`TopicSlug`](src/data/words.ts). Large topics may live in a **separate module** (e.g. [`src/data/topicEverydayNouns100.ts`](src/data/topicEverydayNouns100.ts)) and are merged into `topicWords` from `words.ts`.
- Examples:
  - **Animals**: `pets`, `rodents`, `farm`, `birds`, `wild`, `water` (e.g. farm animals together; pets together; mice and rats in `rodents`, not `pets`).
  - **Family**: `core` vs `extended`.
  - **City**: `mobility`, `public`, `commerce`, `home`.
  - **Nature**: `sky`, `land`, `water`, `plants`, `weather`.

When adding a word: pick the smallest existing `mapGroup` that fits by **scene/subdomain** (not by fine synonym clusters), or add a new id and append it to `MAP_GROUP_ORDER` for that topic. Use optional `tags` on `TopicWord` for author notes and Study behaviour: **`false-friend-XX-YY`** (two language codes) turns off misleading cognate highlighting for that pair; **`cognate-*`** is author-only for now. Full tag rules: [.cursor/rules/words-sky-topic-data.mdc](../../rules/words-sky-topic-data.mdc). **`mapGroup`** ids also appear on Landing **Find a word** hits (humanized label next to the topic title).

## Code: where layout lives

- **[`src/lib/graph.ts`](src/lib/graph.ts)** — `sortRowsByMapGroup`, `layoutTopicPlacements`, `buildTopicGraph`, `humanizeMapGroup`. Clusters are laid in a grid **inside** each contiguous `mapGroup` block, then **`CLUSTER_GROUP_GAP_Y`** (from [`src/lib/constants.ts`](src/lib/constants.ts)) adds space **between** bands. `buildTopicGraph` returns `{ nodes, edges, bands }`:
  - `nodes` is a union of **`wordNode`** clusters and one **`bandLabel`** node per contiguous `mapGroup` (decorative, `selectable: false`, `draggable: false`).
  - `edges` use **`type: 'hubEdge'`** with `data: { kind: 'direct', concept, targetLanguage }` so the custom edge can tint by language and focus mode can dim non-focused lines.
  - `bands: BandMeta[]` drives the **band chip strip** under the topic header; each entry has `groupId`, humanized `label`, `count`, and `centerX/centerY/topY` in canvas units.
- **[`src/lib/clusterLayout.ts`](src/lib/clusterLayout.ts)** — **Radial satellite layout** per concept: the anchor stays at the cluster origin; other visible languages are placed evenly on an orbit whose radius scales with how many satellites you show and is capped so clusters fit **`CLUSTER_COL_WIDTH`** / **`CLUSTER_ROW_HEIGHT`**. The CSS box for `.word-node` is **132 px** wide — keep it aligned with `CLUSTER_MAP_NODE_BOX_W` so orbit radius math matches what renders.
- **[`src/lib/hubEdgePath.ts`](src/lib/hubEdgePath.ts)** — pure `hubEdgePath(sx, sy, tx, ty)` helper that returns a cubic Bezier with control points bowed **perpendicular** to the hub→satellite vector so multiple lines from the same anchor don't sit on the same midline. Has unit tests.
- **[`src/components/HubEdge.tsx`](src/components/HubEdge.tsx)** — custom edge component. Stroke color comes from `languageColors[data.targetLanguage]`; an end-dot near the satellite replaces the old `markerEnd` arrow; opacity from `style.opacity` is used by **focus mode** to dim non-focused edges.
- **[`src/components/BandLabelNode.tsx`](src/components/BandLabelNode.tsx)** — decorative band heading; rendered with `aria-hidden="true"` (band navigation lives in the chip strip).
- **[`src/components/MapBandStrip.tsx`](src/components/MapBandStrip.tsx)** — horizontally scrollable chips under the topic header; each chip jumps the viewport via `rfInstance.setViewport`. Hidden when a topic has fewer than two bands.
- **[`src/components/TopicPage.tsx`](src/components/TopicPage.tsx)** — Map mode ReactFlow; **no MiniMap** (avoids bright overview box on dark UI). Owns `focusedConcept` state: tapping a `wordNode` opens the Map study sheet **and** sets focus, which adds `rf-focused` / `rf-dimmed` `className` on nodes plus a low `style.opacity` on non-focused edges. Pane click and sheet close clear focus.
- **[`src/lib/strings.ts`](src/lib/strings.ts)** — Map legend and chip strip copy (`legendMap`, `mapHint`, `mapBandStripLabel`, `mapBandJumpLabel`, `mapBandProgress`).

## Do / do not

- **Do** keep translation edges only: **hub = learner anchor** (same as Study I speak), one line per other **visible** language within each concept (the visible set follows Study’s translation-language picks via `buildTopicGraph`’s `visibleLanguages` / `mapVisibleLanguageCodes` in [`src/lib/graph.ts`](src/lib/graph.ts)). The custom **`hubEdge`** stays the one edge type; tint it by `data.targetLanguage`, no arrow marker.
- **Do** keep `getGuidedTopicWords` for **Study** ordering (difficulty bands, then **round-robin by `mapGroup`** within a band to limit back-to-back semantic neighbors); the full Map still uses `topicWords` + `mapGroup` sort via `sortRowsByMapGroup`.
- **Do** keep band labels and the band chip strip purely decorative for sighted users (band labels are `aria-hidden`); the chip strip is the announceable wayfinding control.
- **Do not** reintroduce list-order dashed “semantic” edges between different concepts without new explicit data (e.g. `relatedConcepts`) and legend updates.
- **Do not** add a MiniMap; the band chip strip is the wayfinding affordance for large topics.
