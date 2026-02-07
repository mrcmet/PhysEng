export interface CameraTransform {
  offsetX: number; // screen-space pan offset in pixels
  offsetY: number;
  zoom: number; // pixels per meter
}

export class Camera {
  private offsetX = 0;
  private offsetY = 0;
  private zoom = 50; // 50 pixels per meter default
  private canvasWidth = 0;
  private canvasHeight = 0;

  static readonly MIN_ZOOM = 10;    // ~5m scale bar at full zoom-out
  static readonly MAX_ZOOM = 60000; // ~5mm scale bar at full zoom-in
  static readonly ZOOM_FACTOR = 1.15;

  setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  getTransform(): CameraTransform {
    return { offsetX: this.offsetX, offsetY: this.offsetY, zoom: this.zoom };
  }

  getZoom(): number {
    return this.zoom;
  }

  /** Convert world coordinates (meters, Y-up) to screen coordinates (pixels, Y-down) */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.zoom + this.offsetX + this.canvasWidth / 2,
      y: -worldY * this.zoom + this.offsetY + this.canvasHeight / 2,
    };
  }

  /** Convert screen coordinates (pixels, Y-down) to world coordinates (meters, Y-up) */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.canvasWidth / 2 - this.offsetX) / this.zoom,
      y: -(screenY - this.canvasHeight / 2 - this.offsetY) / this.zoom,
    };
  }

  /** Pan by screen-space pixel delta */
  pan(deltaScreenX: number, deltaScreenY: number): void {
    this.offsetX += deltaScreenX;
    this.offsetY += deltaScreenY;
  }

  /** Zoom toward a screen-space point */
  zoomAt(screenX: number, screenY: number, zoomIn: boolean): void {
    const factor = zoomIn ? Camera.ZOOM_FACTOR : 1 / Camera.ZOOM_FACTOR;
    const newZoom = Math.max(Camera.MIN_ZOOM, Math.min(Camera.MAX_ZOOM, this.zoom * factor));
    const ratio = newZoom / this.zoom;

    // Adjust offset so the point under the cursor stays fixed
    const cx = this.canvasWidth / 2;
    const cy = this.canvasHeight / 2;
    this.offsetX = (this.offsetX + cx - screenX) * ratio + screenX - cx;
    this.offsetY = (this.offsetY + cy - screenY) * ratio + screenY - cy;

    this.zoom = newZoom;
  }

  /** Apply the camera transform on top of the current context transform (composes with DPR scaling) */
  applyTransform(ctx: CanvasRenderingContext2D): void {
    const cx = this.canvasWidth / 2;
    const cy = this.canvasHeight / 2;
    // Translate to center + pan offset, then scale with Y-flip
    ctx.translate(this.offsetX + cx, this.offsetY + cy);
    ctx.scale(this.zoom, -this.zoom);
  }

  reset(): void {
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 50;
  }
}
