// Layout grid for clustering concepts in Map mode.
export const CLUSTER_COLUMNS = 5
/** Wide enough for radial language clusters (anchor + up to five satellites). */
export const CLUSTER_COL_WIDTH = 540
export const CLUSTER_ROW_HEIGHT = 470
export const CLUSTER_ORIGIN_X = 180
export const CLUSTER_ORIGIN_Y = 190
export const CLUSTER_ZIGZAG_OFFSET = 0

/** Extra vertical gap after each `mapGroup` band on the Map. */
export const CLUSTER_GROUP_GAP_Y = 160

/** Offset (canvas units) for the band label node relative to the band's first cluster. */
export const CLUSTER_BAND_LABEL_OFFSET_X = 32
export const CLUSTER_BAND_LABEL_OFFSET_Y = 78

/** Estimated map node box for orbit math (see `.word-node` in `src/index.css`). */
export const CLUSTER_MAP_NODE_BOX_W = 132
/** Slightly above single-line height so short wrapped phrases still clear the hub orbit. */
export const CLUSTER_MAP_NODE_BOX_H = 82
export const CLUSTER_ORBIT_GAP = 10
export const CLUSTER_ORBIT_R_MIN = 56
export const CLUSTER_ORBIT_GRID_PAD_X = 38
export const CLUSTER_ORBIT_GRID_PAD_Y = 48

// Learn mode: how many neighbouring concepts to show around the active one.
export const LEARN_NEIGHBORS_PER_SIDE = 1

// Background star field tuning. Lower than the original 220 — the animation
// is decorative and the higher count was visibly stressing low-end devices.
export const STAR_COUNT = 90

// ReactFlow zoom bounds.
export const FLOW_MIN_ZOOM = 0.35
export const FLOW_MAX_ZOOM = 2.1
export const FLOW_FIT_PADDING = 0.25
// Cap zoom-in when fitting so a single node doesn't fill the whole canvas.
export const FLOW_FIT_MAX_ZOOM = 1
export const FLOW_FIT_DURATION_MS = 400
