import { Camera } from './Camera';
import { GridRenderer } from './GridRenderer';
import { PrimitiveRenderer } from './PrimitiveRenderer';
import { GhostRenderer } from './GhostRenderer';
import { CANVAS_BG_COLOR } from './RenderConfig';
import type { AppState } from '../core/AppState';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { Vec2 } from '../core/EventBus';
import type { PrimitiveType } from '../physics/primitives/Primitive';
import type { MarqueeRect } from '../interaction/modes/SelectMode';

export interface GhostState {
  pos: Vec2 | null;
  type: PrimitiveType | null;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private gridRenderer: GridRenderer;
  private primitiveRenderer: PrimitiveRenderer;
  private ghostRenderer: GhostRenderer;
  private dpr = 1;
  ghostState: GhostState = { pos: null, type: null };
  marqueeRect: MarqueeRect | null = null;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = camera;
    this.gridRenderer = new GridRenderer();
    this.primitiveRenderer = new PrimitiveRenderer();
    this.ghostRenderer = new GhostRenderer();
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

    // Draw placement ghost
    this.ghostRenderer.render(ctx, this.camera, this.ghostState.pos, this.ghostState.type);

    // Draw marquee selection rectangle
    if (this.marqueeRect) {
      const m = this.marqueeRect;
      const zoom = this.camera.getZoom();
      ctx.save();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = 1.5 / zoom;
      ctx.setLineDash([4 / zoom, 3 / zoom]);
      const x = Math.min(m.x1, m.x2);
      const y = Math.min(m.y1, m.y2);
      const w = Math.abs(m.x2 - m.x1);
      const h = Math.abs(m.y2 - m.y1);
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }

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
