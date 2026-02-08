import './styles/main.css';
import * as planck from 'planck';
import { Layout } from './ui/Layout';
import { Camera } from './rendering/Camera';
import { CanvasRenderer } from './rendering/CanvasRenderer';
import { AppState } from './core/AppState';
import { EventBus } from './core/EventBus';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { SimulationClock } from './simulation/SimulationClock';
import { InteractionManager } from './interaction/InteractionManager';
import { SelectionManager } from './interaction/SelectionManager';
import { SelectMode } from './interaction/modes/SelectMode';
import { PlaceMode } from './interaction/modes/PlaceMode';
import { PalettePanel } from './ui/panels/PalettePanel';
import { PropertiesPanel } from './ui/panels/PropertiesPanel';
import { SimSettingsPanel } from './ui/panels/SimSettingsPanel';

// --- Bootstrap ---
const app = document.getElementById('app')!;
const layout = new Layout(app);

const eventBus = new EventBus();
const camera = new Camera();
const appState = new AppState();
const physicsWorld = new PhysicsWorld();
const simulationClock = new SimulationClock();
const canvasRenderer = new CanvasRenderer(layout.canvas, camera);
const selectionManager = new SelectionManager(appState, eventBus);

// --- Interaction modes ---
const selectMode = new SelectMode(appState, physicsWorld, selectionManager, eventBus);

const placeMode = new PlaceMode(appState, physicsWorld, selectionManager, eventBus, () => {
  interactionManager.setMode('select');
  palettePanel.clearActive();
  canvasRenderer.ghostState = { pos: null, type: null };
});

const interactionManager = new InteractionManager(layout.canvas, camera, selectMode);
interactionManager.addMode(placeMode);

// --- Palette ---
const palettePanel = new PalettePanel(layout.palette, (type) => {
  placeMode.setPrimitiveType(type);
  interactionManager.setMode('place');
});

// --- Sim Settings Panel ---
const simSettingsPanel = new SimSettingsPanel(layout.simSettingsPanel, appState, physicsWorld, eventBus);

// --- Properties Panel ---
const propertiesPanel = new PropertiesPanel(layout.propertiesPanel, appState, physicsWorld, eventBus);

// --- Update ghost and marquee state each frame for rendering ---
function updateOverlayState(): void {
  if (interactionManager.getActiveModeName() === 'place') {
    const pm = interactionManager.getMode<PlaceMode>('place');
    if (pm) {
      canvasRenderer.ghostState = { pos: pm.getGhostPos(), type: pm.getPrimitiveType() };
    }
  } else {
    canvasRenderer.ghostState = { pos: null, type: null };
  }

  // Marquee selection rect
  const sm = interactionManager.getMode<SelectMode>('select');
  canvasRenderer.marqueeRect = sm ? sm.getMarqueeRect() : null;
}

// Properties panel handles selection changes via its own event listener

// --- Playback bar: simple play/pause/reset for now ---
layout.playbackBar.innerHTML = `
  <button id="btn-play" class="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-medium transition-colors">Play</button>
  <button id="btn-pause" class="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-xs font-medium transition-colors">Pause</button>
  <button id="btn-reset" class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors">Reset</button>
  <span id="sim-status" class="text-gray-400 text-xs ml-2">Editing</span>
  <span id="sim-time" class="text-gray-500 text-xs ml-auto">t = 0.00s</span>
`;

const btnPlay = document.getElementById('btn-play')!;
const btnPause = document.getElementById('btn-pause')!;
const btnReset = document.getElementById('btn-reset')!;
const simStatus = document.getElementById('sim-status')!;
const simTime = document.getElementById('sim-time')!;

// Store initial positions for reset
let initialState: Map<string, { x: number; y: number; angle: number }> = new Map();

function captureInitialState(): void {
  initialState.clear();
  for (const [id, prim] of appState.primitives) {
    initialState.set(id, { x: prim.props.position.x, y: prim.props.position.y, angle: prim.props.angle });
  }
}

btnPlay.addEventListener('click', () => {
  if (appState.simulationState === 'editing') {
    captureInitialState();
  }
  appState.simulationState = 'playing';
  simStatus.textContent = 'Playing';
  eventBus.emit('simulation:state-changed', { state: 'playing' });
});

btnPause.addEventListener('click', () => {
  if (appState.simulationState === 'playing') {
    appState.simulationState = 'paused';
    simulationClock.pause();
    simStatus.textContent = 'Paused';
    eventBus.emit('simulation:state-changed', { state: 'paused' });
  }
});

btnReset.addEventListener('click', () => {
  appState.simulationState = 'editing';
  simulationClock.reset();
  simStatus.textContent = 'Editing';
  simTime.textContent = 't = 0.00s';

  // Restore initial positions
  for (const [id, state] of initialState) {
    const prim = appState.getPrimitive(id);
    const body = physicsWorld.getBody(id);
    if (prim && body) {
      prim.props.position = { x: state.x, y: state.y };
      prim.props.angle = state.angle;
      body.setPosition(new planck.Vec2(state.x, state.y));
      body.setAngle(state.angle);
      body.setLinearVelocity(new planck.Vec2(0, 0));
      body.setAngularVelocity(0);
      body.setAwake(true);
    }
  }

  eventBus.emit('simulation:state-changed', { state: 'editing' });
});

// --- Render loop ---
function mainLoop(timestamp: number): void {
  // Physics stepping
  if (appState.simulationState === 'playing') {
    const steps = simulationClock.update(timestamp, physicsWorld.getFixedTimestep());
    for (let i = 0; i < steps; i++) {
      physicsWorld.step();
    }
    simTime.textContent = `t = ${simulationClock.getSimulationTime().toFixed(2)}s`;
  }

  // Update overlays
  updateOverlayState();

  // Render
  canvasRenderer.render(appState, physicsWorld);

  requestAnimationFrame(mainLoop);
}

// Handle window resize
const resizeObserver = new ResizeObserver(() => {
  canvasRenderer.handleResize();
});
resizeObserver.observe(layout.canvasContainer);

requestAnimationFrame(mainLoop);
