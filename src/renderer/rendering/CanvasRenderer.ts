import { Camera } from './Camera';
import { GridRenderer } from './GridRenderer';
import { PrimitiveRenderer } from './PrimitiveRenderer';
import { CANVAS_BG_COLOR } from './RenderConfig';
import type { AppState } from '../core/AppState';
import type { PhysicsWorld } from '../physics/PhysicsWorld';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private gridRenderer: GridRenderer;
  private primitiveRenderer: PrimitiveRenderer;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = camera;
    this.gridRenderer = new GridRenderer();
    this.primitiveRenderer = new PrimitiveRenderer();
    this.handleResize();
  }

  handleResize(): void {
    this.dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.camera.setCanvasSize(rect.width, rect.height);
  }

  render(appState: AppState, physicsWorld: PhysicsWorld): void {
    const ctx = this.ctx;
    const cssWidth = this.canvas.width / this.dpr;
    const cssHeight = this.canvas.height / this.dpr;

    // Clear in physical pixel space
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = CANVAS_BG_COLOR;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Scale for DPR, then apply camera transform (world-space)
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.camera.applyTransform(ctx);

    // Draw grid
    this.gridRenderer.render(ctx, this.camera, cssWidth, cssHeight);

    // Draw primitives
    this.primitiveRenderer.render(ctx, this.camera, appState, physicsWorld);

    // Restore to screen-space for overlays
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Scale label overlay
    this.gridRenderer.renderScaleLabel(ctx, this.camera, cssHeight);
  }

  getCamera(): Camera {
    return this.camera;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
