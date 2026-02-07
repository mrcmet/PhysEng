# PhysEng: Engineering Physics Simulator

## Context

Build a desktop Electron application for engineering physics simulation with a drag-and-drop interface, editable primitives, connections (springs, dampers, joints), full simulation playback controls, and real-time graphing of position/velocity/acceleration.

## Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Desktop framework | Electron (via Electron Forge + Vite plugin) | Official toolchain, HMR, packaging built-in |
| Language | TypeScript | Type safety across the entire codebase |
| Physics engine | Planck.js v1.x (`planck` package) | Box2D port, precise engineering-grade 2D physics |
| Rendering | HTML5 Canvas 2D | Simple, performant, direct pixel control |
| Charting | Plotly.js (`plotly.js-dist-min`) | Scientific/engineering graphs, zoom/pan/export built-in |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first, no config file needed in v4 |
| UI approach | Vanilla TypeScript components | No React/Vue — lightweight component base class + EventBus |

## Project Structure

```
PhysEng/
├── package.json
├── tsconfig.json
├── forge.config.ts
├── vite.main.config.ts
├── vite.preload.config.ts
├── vite.renderer.config.ts
│
├── src/
│   ├── main/
│   │   └── main.ts                          # Electron main process
│   │
│   ├── preload/
│   │   └── preload.ts                       # Context bridge (file dialogs, fs access)
│   │
│   ├── renderer/
│   │   ├── index.html                       # HTML shell
│   │   ├── index.ts                         # Entry point, bootstraps app
│   │   ├── styles/
│   │   │   └── main.css                     # Tailwind imports + custom styles
│   │   │
│   │   ├── core/
│   │   │   ├── EventBus.ts                  # Typed pub/sub event system
│   │   │   ├── AppState.ts                  # Central application state
│   │   │   └── IdGenerator.ts               # Unique ID generation
│   │   │
│   │   ├── physics/
│   │   │   ├── PhysicsWorld.ts              # Planck.js World wrapper
│   │   │   ├── PhysicsConfig.ts             # Default constants, timestep bounds
│   │   │   ├── primitives/
│   │   │   │   ├── Primitive.ts             # Abstract base class
│   │   │   │   ├── RectanglePrimitive.ts    # Rectangle rigid body
│   │   │   │   ├── CirclePrimitive.ts       # Circle rigid body
│   │   │   │   ├── GroundPrimitive.ts       # Static ground body
│   │   │   │   └── PrimitiveFactory.ts      # Factory for creating primitives
│   │   │   └── connections/
│   │   │       ├── Connection.ts            # Abstract base for connections
│   │   │       ├── RevoluteConnection.ts    # Hinge joint
│   │   │       ├── PrismaticConnection.ts   # Slider joint
│   │   │       ├── WeldConnection.ts        # Rigid weld
│   │   │       ├── SpringConnection.ts      # Spring (DistanceJoint + frequencyHz)
│   │   │       ├── DamperConnection.ts      # Damper (DistanceJoint + dampingRatio)
│   │   │       └── ConnectionFactory.ts     # Factory for creating connections
│   │   │
│   │   ├── simulation/
│   │   │   ├── SimulationController.ts      # Play/pause/step/speed orchestrator
│   │   │   ├── SimulationClock.ts           # Fixed timestep, speed scaling
│   │   │   ├── HistoryRecorder.ts           # Records world state each frame
│   │   │   ├── HistoryPlayback.ts           # Restores snapshots for scrubbing
│   │   │   └── StateSnapshot.ts             # Serializable frame snapshot type
│   │   │
│   │   ├── rendering/
│   │   │   ├── CanvasRenderer.ts            # Main canvas draw loop
│   │   │   ├── Camera.ts                    # Pan/zoom viewport transform
│   │   │   ├── GridRenderer.ts              # Background grid with scale
│   │   │   ├── PrimitiveRenderer.ts         # Draws bodies (rect, circle, ground)
│   │   │   ├── ConnectionRenderer.ts        # Draws springs, dampers, joints
│   │   │   ├── SelectionRenderer.ts         # Highlights and handles
│   │   │   ├── GhostRenderer.ts             # Drag preview placement ghost
│   │   │   └── RenderConfig.ts              # Colors, stroke widths, constants
│   │   │
│   │   ├── interaction/
│   │   │   ├── InteractionManager.ts        # Routes mouse/keyboard events
│   │   │   ├── SelectionManager.ts          # Tracks selected entities
│   │   │   ├── DragDropManager.ts           # Palette-to-canvas drag logic
│   │   │   ├── HitTesting.ts               # Point-in-shape queries
│   │   │   └── modes/
│   │   │       ├── InteractionMode.ts       # Interface for all modes
│   │   │       ├── SelectMode.ts            # Click-select, drag-move
│   │   │       ├── PlaceMode.ts             # Drag-from-palette placement
│   │   │       ├── ConnectMode.ts           # Draw connections between bodies
│   │   │       └── PanMode.ts               # Pan and zoom navigation
│   │   │
│   │   ├── scene/
│   │   │   ├── SceneSerializer.ts           # Serialize scene to JSON
│   │   │   ├── SceneDeserializer.ts         # Load scene from JSON
│   │   │   ├── SceneFileManager.ts          # Native open/save dialogs (via IPC)
│   │   │   └── SceneSchema.ts               # Scene file format type definitions
│   │   │
│   │   ├── data/
│   │   │   ├── DataRecorder.ts              # Records per-frame data for graphs
│   │   │   ├── DataSeries.ts                # Time-series data structure
│   │   │   └── DataExporter.ts              # CSV/JSON export
│   │   │
│   │   ├── graphing/
│   │   │   ├── GraphPanel.ts                # Plotly chart container
│   │   │   ├── GraphController.ts           # Manages active traces
│   │   │   ├── TraceBinding.ts              # Links body property to trace
│   │   │   └── GraphConfig.ts               # Default graph styles
│   │   │
│   │   └── ui/
│   │       ├── components/
│   │       │   ├── UIComponent.ts           # Base class for all UI components
│   │       │   ├── Panel.ts                 # Generic collapsible panel
│   │       │   ├── NumberInput.ts           # Numeric input with units
│   │       │   ├── SliderInput.ts           # Range slider with label
│   │       │   ├── DropdownSelect.ts        # Select dropdown
│   │       │   ├── ToggleButton.ts          # On/off toggle
│   │       │   └── IconButton.ts            # Toolbar icon button
│   │       ├── panels/
│   │       │   ├── ToolbarPanel.ts          # Top toolbar (file, mode, settings)
│   │       │   ├── SimSettingsPanel.ts      # Simulation settings (timestep, gravity)
│   │       │   ├── PalettePanel.ts          # Left sidebar: draggable primitives
│   │       │   ├── PropertiesPanel.ts       # Right sidebar: editable props
│   │       │   ├── PlaybackPanel.ts         # Bottom: simulation controls
│   │       │   └── GraphPanelUI.ts          # Bottom: expandable graph area
│   │       └── Layout.ts                    # Root layout manager
│   │
│   └── shared/
│       └── types.ts                         # Shared types
│
└── assets/
    └── icons/                               # SVG icons for toolbar/palette
```

## Architecture Overview

**Event-driven, layered design.** All modules communicate through a typed `EventBus`. No framework — vanilla TypeScript classes with Tailwind-styled DOM elements.

```
┌──────────────────────────────────────────────────────────────┐
│                        UI Layer                               │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Palette  │ │ Properties │ │ Playback │ │  Graph UI    │  │
│  └────┬─────┘ └─────┬──────┘ └────┬─────┘ └──────┬───────┘  │
├───────┴──────────────┴─────────────┴──────────────┴──────────┤
│                     EventBus (typed pub/sub)                  │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌──────────┐ ┌──────────────┐ ┌─────────┐ │
│  │ Interaction │ │Selection │ │  Simulation  │ │  Data   │ │
│  │  Manager    │ │ Manager  │ │  Controller  │ │Recorder │ │
│  └──────┬──────┘ └────┬─────┘ └──────┬───────┘ └────┬────┘ │
├─────────┴──────────────┴──────────────┴──────────────┴───────┤
│                     Physics World                             │
│         (Planck.js World + Primitives + Connections)          │
├──────────────────────────────────────────────────────────────┤
│                     Canvas Renderer                           │
│    (Camera + Grid + Primitives + Connections + Selection)     │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow Examples

1. **Drag primitive from palette** → `DragDropManager` → EventBus `primitive:place-request` → `PhysicsWorld` creates body → EventBus `primitive:created` → Canvas renders it
2. **Select object** → `InteractionManager` hit test → `SelectionManager` → EventBus `selection:changed` → `PropertiesPanel` populates fields
3. **Edit property** → `PropertiesPanel` → EventBus `primitive:property-changed` → `PhysicsWorld` updates Planck body → re-render
4. **Click Play** → EventBus `simulation:play` → `SimulationController` starts stepping → each step: physics + history record + data record + render
5. **Scrub timeline** → EventBus `simulation:seek` → `HistoryPlayback` restores snapshot → render + graph cursor update

## Window Layout

```
┌──────────────────────────────────────────────────┐
│                  Toolbar (top)                    │
├──────┬─────────────────────────────┬─────────────┤
│      │                             │             │
│  P   │                             │  Properties │
│  a   │        Canvas               │    Panel    │
│  l   │      (workspace)            │   (right)   │
│  e   │                             │             │
│  t   │                             │             │
│  t   ├─────────────────────────────┤             │
│  e   │      Graph Panel            │             │
│      │     (bottom, resizable)     │             │
├──────┴─────────────────────────────┴─────────────┤
│              Playback Controls (bottom)           │
└──────────────────────────────────────────────────┘
```

## Physics Engine Integration

### Primitive → Planck.js Mapping

| Primitive | Planck Body Type | Planck Shape | Key Properties |
|-----------|-----------------|-------------|----------------|
| Rectangle | `dynamic` (default) | `planck.Box(halfW, halfH)` | density, friction, restitution |
| Circle | `dynamic` (default) | `planck.Circle(radius)` | density, friction, restitution |
| Ground | `static` (always) | `planck.Edge(v1, v2)` | friction, restitution |

### Connection → Planck.js Joint Mapping

| Connection | Planck Joint | Key Parameters |
|-----------|-------------|----------------|
| Revolute | `RevoluteJoint` | enableLimit, lowerAngle, upperAngle, enableMotor |
| Prismatic | `PrismaticJoint` | localAxisA, enableLimit, lower/upperTranslation |
| Weld | `WeldJoint` | frequencyHz (0 = rigid), dampingRatio |
| Spring | `DistanceJoint` | restLength, frequencyHz > 0, dampingRatio |
| Damper | `DistanceJoint` | restLength, frequencyHz (low), dampingRatio (>= 1.0) |

### Coordinate System

- Planck.js: **meters, Y-up** (physics convention)
- Canvas: **pixels, Y-down**
- Camera handles the flip: `ctx.setTransform(zoom, 0, 0, -zoom, offsetX, canvasHeight - offsetY)`

### Physics Constants & User-Adjustable Timestep

```
Gravity:             (0, -9.81) m/s²  (user-adjustable per scene)
Fixed timestep:      User-adjustable   (see bounds below)
Velocity iterations: 8
Position iterations: 3
```

**Timestep is a user-adjustable simulation parameter** exposed in the Simulation Settings panel (`SimSettingsPanel.ts`). It is only editable while in `Editing` state — the control is disabled/greyed out during `Playing`, `Paused`, and `Scrubbing` states. Changing the timestep between runs forces a full reset (history cleared) since recorded frames at the old timestep are invalid.

| Parameter | Default | Min | Max | Unit | Notes |
|-----------|---------|-----|-----|------|-------|
| `fixedTimestep` | 1/60 (0.01667) | 1/240 (0.00417) | 1/10 (0.1) | seconds | Smaller = more accurate but slower |

- **1/240 s** (lower bound): High-precision mode. Useful for stiff springs or fast collisions. 4x computational cost vs default.
- **1/60 s** (default): Standard real-time physics. Good balance of accuracy and performance.
- **1/30 s**: Acceptable for slow-moving, simple scenes. 2x faster than default.
- **1/10 s** (upper bound): Coarse stepping. Risk of tunneling and instability. Useful only for very slow, large-scale simulations.

The UI presents this as a dropdown or slider labeled "Physics Timestep" with presets (1/240, 1/120, 1/60, 1/30, 1/10) and a custom input option. The value is stored in `PhysicsConfig` and passed to `SimulationClock` on each run.

### Mass vs Density

Users set mass directly (kg). Internally computed as `density = mass / area`. Changing either updates the other bidirectionally in the properties panel.

## Simulation State Machine

```
              ┌─────────┐
     reset    │         │  place/edit primitives
  ┌──────────►│ Editing │◄── drag, properties, delete
  │           └────┬────┘
  │                │ play
  │                ▼
  │           ┌─────────┐
  │           │ Playing │──── steps physics + records history
  │           └────┬────┘
  │                │ pause
  │                ▼
  │           ┌─────────┐
  │    play   │         │  step forward / step backward
  │ ┌────────►│ Paused  │
  │ │         └────┬────┘
  │ │              │ drag scrubber
  │ │              ▼
  │ │         ┌──────────┐
  │ │         │Scrubbing │  restores snapshots continuously
  │ │         └────┬─────┘
  │ │              │ release
  │ │              ▼
  │ └────────┐Paused  ┐
  └──────────┘        │
             └────────┘
```

### History Recording

- **Capture**: After each `world.step()`, record `{ position, angle, linearVelocity, angularVelocity }` per dynamic body (~40 bytes/body/frame)
- **Restore**: Set body transforms + velocities from snapshot, wake all bodies
- **Memory**: ~50 MB for 20 bodies over 10 minutes at 60 Hz
- **Re-simulation**: Scrub backward → press Play → truncate future frames, re-simulate from that point (deterministic with fixed timestep)

## Data Recording & Graphing

### Trackable Properties

- `position.x`, `position.y`
- `velocity.x`, `velocity.y`, `speed`
- `acceleration.x`, `acceleration.y` (computed as finite difference of velocity)
- `angle`, `angularVelocity`

### How Users Add Traces

1. **Right-click body** → context menu → "Track..." → select property
2. **Select body** → Graph panel → "Add Trace" dropdown

### Graph Behavior

- Live updates at ~10 Hz during simulation (via `Plotly.react()`)
- Vertical cursor line shows current time during scrubbing
- Auto-scaling axes
- CSV export of recorded data

## Scene Save & Load

### File Format

Scenes are saved as `.physeng` files (JSON with a custom extension). The format:

```typescript
interface SceneFile {
  version: 1;                           // Schema version for forward compat
  name: string;                         // Scene name
  createdAt: string;                    // ISO 8601 timestamp
  modifiedAt: string;                   // ISO 8601 timestamp

  settings: {
    gravity: { x: number; y: number };  // m/s²
    fixedTimestep: number;              // seconds (user-configured)
    velocityIterations: number;
    positionIterations: number;
  };

  camera: {
    offsetX: number;
    offsetY: number;
    zoom: number;
  };

  primitives: SerializedPrimitive[];    // All bodies with full properties
  connections: SerializedConnection[];  // All joints/springs/dampers
  graphBindings: SerializedTrace[];     // Which traces are configured
}
```

### User Workflow

- **File > New Scene** (`Ctrl+N`): Clears current scene, resets to defaults. Prompts to save if unsaved changes.
- **File > Open Scene** (`Ctrl+O`): Native file dialog (via Electron `dialog.showOpenDialog`), filters for `*.physeng`. Loads and replaces current scene.
- **File > Save** (`Ctrl+S`): Saves to current file path. If no path (new scene), behaves like Save As.
- **File > Save As** (`Ctrl+Shift+S`): Native save dialog, writes `.physeng` file.
- **Recent files**: Toolbar tracks last 5 opened files for quick access.

### Implementation

- `SceneSerializer.ts`: Iterates `AppState.primitives` and `AppState.connections`, calls `.toSerializable()` on each, assembles the `SceneFile` JSON.
- `SceneDeserializer.ts`: Validates JSON against `SceneSchema`, calls `PrimitiveFactory` and `ConnectionFactory` to recreate all entities, restores camera position.
- `SceneFileManager.ts`: Coordinates save/load via IPC to main process (Electron's `dialog` API lives in main process). Tracks current file path and dirty state.
- `preload.ts`: Exposes `electronAPI.showOpenDialog()`, `electronAPI.showSaveDialog()`, `electronAPI.readFile()`, `electronAPI.writeFile()` via context bridge.
- `main.ts`: Handles IPC for file dialog and fs operations.

### Dirty State Tracking

The app tracks whether the scene has unsaved changes (primitive added/removed/edited, connection changed, settings changed). The title bar shows `*` when dirty. Closing the window or opening a new scene prompts "Save changes?" if dirty.

## Interaction Modes

| Mode | Activation | Behavior |
|------|-----------|----------|
| **Select** | Default / press `V` | Click to select, drag to move, Shift+click multi-select, Delete to remove |
| **Place** | Drag from palette | Ghost preview follows cursor, click to place, Escape to cancel |
| **Connect** | Click connection tool | Click body A → click body B → connection created |
| **Pan** | Always available | Scroll wheel = zoom, Middle-click drag = pan, Space+drag = pan |

### Editing Lock

During simulation (Playing/Paused): palette disabled, properties read-only, no placement. Selection still works for tracking/graphing.

## Implementation Phases

### Phase 1: Scaffolding + Canvas Foundation
- Scaffold Electron Forge project with Vite + TypeScript template
- Install deps: `planck`, `plotly.js-dist-min`, `@tailwindcss/vite`
- Configure Tailwind v4 in `vite.renderer.config.ts`
- Set up `preload.ts` with context bridge for file dialogs and fs access
- Build `Layout.ts` (HTML structure with panels and canvas)
- Build `Camera.ts` (pan/zoom), `CanvasRenderer.ts`, `GridRenderer.ts`
- Wire `requestAnimationFrame` loop
- **Result**: Electron window with pannable/zoomable infinite grid

### Phase 2: Physics World + Primitives
- Build `EventBus.ts`, `AppState.ts`, `IdGenerator.ts`
- Build `Primitive.ts` (abstract), `RectanglePrimitive.ts`, `CirclePrimitive.ts`, `GroundPrimitive.ts`
- Build `PhysicsWorld.ts` — Planck.js wrapper with body management
- Build `PrimitiveRenderer.ts`
- Hardcode test scene: ground + falling rectangle + bouncing circle
- Build `SimulationClock.ts` with fixed timestep
- **Result**: Bodies falling and bouncing on ground

### Phase 3: Interaction — Selection + Placement
- Build `HitTesting.ts`, `InteractionManager.ts`, mode system
- Build `SelectMode.ts`, `SelectionManager.ts`, `SelectionRenderer.ts`
- Build `PalettePanel.ts` with draggable icons
- Build `PlaceMode.ts`, `DragDropManager.ts`, `GhostRenderer.ts`
- Build `PanMode.ts`
- **Result**: Drag primitives from palette, click to select, pan/zoom

### Phase 4: Property Editing + Simulation Settings
- Build base UI components: `NumberInput.ts`, `SliderInput.ts`, `DropdownSelect.ts`, `ToggleButton.ts`
- Build `PropertiesPanel.ts` — populates based on selection
- Build `SimSettingsPanel.ts` — timestep selector (dropdown with presets + custom), gravity inputs
- Wire property changes back to `PhysicsWorld` via EventBus
- Mass/density bidirectional calculation
- Timestep only editable in Editing state; changing it clears history
- **Result**: Select body, edit properties, configure simulation timestep

### Phase 5: Connections (Joints, Springs, Dampers)
- Build `Connection.ts` (abstract) + all connection types
- Add joint management to `PhysicsWorld.ts`
- Build `ConnectMode.ts` — click A → click B → create connection
- Build `ConnectionRenderer.ts` — zigzag springs, piston dampers, joint dots
- Add connection properties to `PropertiesPanel.ts`
- **Result**: Connect bodies with springs/dampers/joints, simulate oscillation

### Phase 6: Simulation Playback Controls
- Build `SimulationController.ts` (full state machine)
- Build `HistoryRecorder.ts`, `HistoryPlayback.ts`, `StateSnapshot.ts`
- Build `PlaybackPanel.ts` — play/pause/step/speed/scrubber/reset
- Implement timeline scrubbing with snapshot restore
- **Result**: Full playback controls — play, pause, step, scrub, reset

### Phase 7: Data Recording + Graphs
- Build `DataSeries.ts`, `DataRecorder.ts`, `TraceBinding.ts`
- Build `GraphPanel.ts` — Plotly integration
- Build `GraphController.ts`, `GraphPanelUI.ts`
- Right-click context menu for "Track property..."
- Wire recording into simulation loop
- Graph time cursor during scrubbing
- CSV export
- **Result**: Track body properties, see live graphs, scrub with cursor

### Phase 8: Scene Save/Load
- Build `SceneSchema.ts` — file format type definitions
- Build `SceneSerializer.ts` — serialize AppState to JSON
- Build `SceneDeserializer.ts` — validate and recreate scene from JSON
- Build `SceneFileManager.ts` — IPC bridge to Electron file dialogs
- Add IPC handlers in `main.ts` for `showOpenDialog`, `showSaveDialog`, `readFile`, `writeFile`
- Expose file APIs via `preload.ts` context bridge
- Add File menu to `ToolbarPanel.ts` (New, Open, Save, Save As, Recent)
- Implement dirty state tracking (title bar `*` indicator)
- Unsaved changes prompt on close/new/open
- Keyboard shortcuts: `Ctrl+N`, `Ctrl+O`, `Ctrl+S`, `Ctrl+Shift+S`
- **Result**: Full save/load of `.physeng` scene files with native dialogs

### Phase 9: Polish + Packaging
- Keyboard shortcuts (Space = play/pause, arrows = step, Delete = remove)
- Consistent color scheme, tooltips
- Error handling (delete body with connections, etc.)
- Electron packaging via `npm run make`
- Performance profiling (target: 60fps with 50+ bodies)

## Verification

1. `npm start` — launches Electron window with grid canvas
2. Drag rectangle and circle from palette onto canvas
3. Click ground tool to place ground surface
4. Select a body → edit mass, friction, size in properties panel
5. Change timestep to 1/120 in Simulation Settings → verify control disabled during playback
6. Connect two bodies with a spring → run simulation → observe oscillation
7. Right-click a body → "Track Position Y" → graph appears
8. Play → pause → step forward → step backward → scrub timeline
9. Adjust speed to 0.5x and 2x → verify consistent physics
10. Reset → all bodies return to initial positions, graphs clear
11. File → Save As → save scene as `test.physeng`
12. File → New Scene → confirm empty canvas
13. File → Open → load `test.physeng` → verify all primitives, connections, settings restored
14. Modify scene → close window → confirm "Save changes?" prompt appears
15. Export graph data to CSV
