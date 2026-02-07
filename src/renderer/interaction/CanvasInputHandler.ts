import { Camera } from '../rendering/Camera';

/**
 * Handles canvas mouse/keyboard input for pan and zoom.
 * Phase 1: pan (middle-click or space+left-click drag) and zoom (scroll wheel).
 */
export class CanvasInputHandler {
  private canvas: HTMLCanvasElement;
  private camera: Camera;
  private isPanning = false;
  private isSpaceHeld = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private onChanged: () => void;

  constructor(canvas: HTMLCanvasElement, camera: Camera, onChanged: () => void) {
    this.canvas = canvas;
    this.camera = camera;
    this.onChanged = onChanged;
    this.bind();
  }

  private bind(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('mouseleave', this.onMouseUp);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onMouseDown = (e: MouseEvent): void => {
    // Middle mouse button or space+left click = pan
    if (e.button === 1 || (e.button === 0 && this.isSpaceHeld)) {
      this.isPanning = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.canvas.style.cursor = 'grabbing';
      e.preventDefault();
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.isPanning) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.camera.pan(dx, dy);
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.onChanged();
    }
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (this.isPanning && (e.button === 1 || e.button === 0 || e.type === 'mouseleave')) {
      this.isPanning = false;
      this.canvas.style.cursor = this.isSpaceHeld ? 'grab' : 'default';
    }
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    this.camera.zoomAt(screenX, screenY, e.deltaY < 0);
    this.onChanged();
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'Space' && !this.isSpaceHeld) {
      this.isSpaceHeld = true;
      this.canvas.style.cursor = 'grab';
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'Space') {
      this.isSpaceHeld = false;
      if (!this.isPanning) {
        this.canvas.style.cursor = 'default';
      }
    }
  };
}
