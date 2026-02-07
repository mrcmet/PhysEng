import './styles/main.css';
import { Layout } from './ui/Layout';
import { Camera } from './rendering/Camera';
import { CanvasRenderer } from './rendering/CanvasRenderer';
import { CanvasInputHandler } from './interaction/CanvasInputHandler';
import { AppState } from './core/AppState';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { SimulationClock } from './simulation/SimulationClock';
import { createPrimitive } from './physics/primitives/PrimitiveFactory';

// --- Bootstrap ---
const app = document.getElementById('app')!;
const layout = new Layout(app);

const camera = new Camera();
const appState = new AppState();
const physicsWorld = new PhysicsWorld();
const simulationClock = new SimulationClock();
const renderer = new CanvasRenderer(layout.canvas, camera);

// --- Test scene ---
const ground = createPrimitive('ground', { x: 0, y: -3 });
appState.addPrimitive(ground);
physicsWorld.addPrimitive(ground);

const rect = createPrimitive('rectangle', { x: -1, y: 4 });
appState.addPrimitive(rect);
physicsWorld.addPrimitive(rect);

const circle = createPrimitive('circle', { x: 0.5, y: 6 });
appState.addPrimitive(circle);
physicsWorld.addPrimitive(circle);

const rect2 = createPrimitive('rectangle', { x: 0.2, y: 8 });
appState.addPrimitive(rect2);
physicsWorld.addPrimitive(rect2);

// Start simulation immediately for testing
appState.simulationState = 'playing';

// --- Input ---
new CanvasInputHandler(layout.canvas, camera, () => {});

// --- Render loop ---
function mainLoop(timestamp: number): void {
  // Physics stepping
  if (appState.simulationState === 'playing') {
    const steps = simulationClock.update(timestamp, physicsWorld.getFixedTimestep());
    for (let i = 0; i < steps; i++) {
      physicsWorld.step();
    }
  }

  // Render
  renderer.render(appState, physicsWorld);

  requestAnimationFrame(mainLoop);
}

// Handle window resize
const resizeObserver = new ResizeObserver(() => {
  renderer.handleResize();
});
resizeObserver.observe(layout.canvasContainer);

requestAnimationFrame(mainLoop);
