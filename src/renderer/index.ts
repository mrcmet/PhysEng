import './styles/main.css';
import { Layout } from './ui/Layout';
import { Camera } from './rendering/Camera';
import { CanvasRenderer } from './rendering/CanvasRenderer';
import { CanvasInputHandler } from './interaction/CanvasInputHandler';

const app = document.getElementById('app')!;
const layout = new Layout(app);

const camera = new Camera();
const renderer = new CanvasRenderer(layout.canvas, camera);

// Pan/zoom input
new CanvasInputHandler(layout.canvas, camera, () => {
  // Input changed — next frame will re-render
});

// Render loop
function mainLoop(): void {
  renderer.render();
  requestAnimationFrame(mainLoop);
}

// Handle window resize
const resizeObserver = new ResizeObserver(() => {
  renderer.handleResize();
});
resizeObserver.observe(layout.canvasContainer);

requestAnimationFrame(mainLoop);
