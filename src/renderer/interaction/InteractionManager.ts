import type { Camera } from '../rendering/Camera';
import type { InteractionMode } from './modes/InteractionMode';
import type { Vec2 } from '../core/EventBus';

export class InteractionManager {
  private canvas: HTMLCanvasElement;
  private camera: Camera;
  private activeMode: InteractionMode;
  private modes = new Map<string, InteractionMode>();

  // Pan state (always available regardless of mode)
  private isPanning = false;
  private isSpaceHeld = false;
  private lastPanX = 0;
  private lastPanY = 0;

  constructor(canvas: HTMLCanvasElement, camera: Camera, defaultMode: InteractionMode) {
    this.canvas = canvas;
    this.camera = camera;
    this.activeMode = defaultMode;
    this.addMode(defaultMode);
    this.bind();
    this.updateCursor();
  }

  addMode(mode: InteractionMode): void {
    this.modes.set(mode.name, mode);
  }

  setMode(name: string): void {
    const mode = this.modes.get(name);
    if (!mode || mode === this.activeMode) return;
    this.activeMode.deactivate();
    this.activeMode = mode;
    this.activeMode.activate();
    this.updateCursor();
  }

  getActiveModeName(): string {
    return this.activeMode.name;
  }

  getMode<T extends InteractionMode>(name: string): T | undefined {
    return this.modes.get(name) as T | undefined;
  }

  private bind(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private screenToWorld(screenX: number, screenY: number): Vec2 {
    return this.camera.screenToWorld(screenX, screenY);
  }

  private getScreenPos(e: MouseEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private onMouseDown = (e: MouseEvent): void => {
    const screenPos = this.getScreenPos(e);

    // Middle mouse or space+left = pan (always available)
    if (e.button === 1 || (e.button === 0 && this.isSpaceHeld)) {
      this.isPanning = true;
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;
      this.canvas.style.cursor = 'grabbing';
      e.preventDefault();
      return;
    }

    const worldPos = this.screenToWorld(screenPos.x, screenPos.y);
    this.activeMode.onMouseDown(worldPos, screenPos, e);
    this.updateCursor();
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.isPanning) {
      const dx = e.clientX - this.lastPanX;
      const dy = e.clientY - this.lastPanY;
      this.camera.pan(dx, dy);
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;
      return;
    }

    const screenPos = this.getScreenPos(e);
    const worldPos = this.screenToWorld(screenPos.x, screenPos.y);
    this.activeMode.onMouseMove(worldPos, screenPos, e);
    this.updateCursor();
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (this.isPanning && (e.button === 1 || e.button === 0)) {
      this.isPanning = false;
      this.updateCursor();
      return;
    }

    const screenPos = this.getScreenPos(e);
    const worldPos = this.screenToWorld(screenPos.x, screenPos.y);
    this.activeMode.onMouseUp(worldPos, screenPos, e);
    this.updateCursor();
  };

  private onMouseLeave = (): void => {
    if (this.isPanning) {
      this.isPanning = false;
      this.updateCursor();
    }
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const screenPos = this.getScreenPos(e);
    this.camera.zoomAt(screenPos.x, screenPos.y, e.deltaY < 0);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'Space' && !this.isSpaceHeld) {
      this.isSpaceHeld = true;
      this.canvas.style.cursor = 'grab';
      e.preventDefault();
      return;
    }
    this.activeMode.onKeyDown(e);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'Space') {
      this.isSpaceHeld = false;
      this.updateCursor();
      return;
    }
    this.activeMode.onKeyUp(e);
  };

  private updateCursor(): void {
    if (this.isSpaceHeld) {
      this.canvas.style.cursor = this.isPanning ? 'grabbing' : 'grab';
    } else if (this.isPanning) {
      this.canvas.style.cursor = 'grabbing';
    } else {
      this.canvas.style.cursor = this.activeMode.cursor;
    }
  }
}
