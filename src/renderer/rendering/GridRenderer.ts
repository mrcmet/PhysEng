import { Camera } from './Camera';

export class GridRenderer {
  render(ctx: CanvasRenderingContext2D, camera: Camera, canvasWidth: number, canvasHeight: number): void {
    const zoom = camera.getZoom();

    // Determine grid spacing that looks good at this zoom level
    // We want gridlines roughly every 40-120 pixels on screen
    const targetPixelSpacing = 60;
    const rawWorldSpacing = targetPixelSpacing / zoom;

    // Snap to a "nice" interval: 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10...
    const minorSpacing = this.niceInterval(rawWorldSpacing);
    const majorSpacing = minorSpacing * 5;

    // Find world bounds visible on screen
    const topLeft = camera.screenToWorld(0, 0);
    const bottomRight = camera.screenToWorld(canvasWidth, canvasHeight);

    const worldLeft = Math.min(topLeft.x, bottomRight.x);
    const worldRight = Math.max(topLeft.x, bottomRight.x);
    const worldBottom = Math.min(topLeft.y, bottomRight.y);
    const worldTop = Math.max(topLeft.y, bottomRight.y);

    // Minor grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1 / zoom;
    this.drawGridLines(ctx, worldLeft, worldRight, worldBottom, worldTop, minorSpacing);

    // Major grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1 / zoom;
    this.drawGridLines(ctx, worldLeft, worldRight, worldBottom, worldTop, majorSpacing);

    // Axis lines
    // X axis (red)
    if (worldBottom <= 0 && worldTop >= 0) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(worldLeft, 0);
      ctx.lineTo(worldRight, 0);
      ctx.stroke();
    }

    // Y axis (green)
    if (worldLeft <= 0 && worldRight >= 0) {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.lineWidth = 2 / zoom;
      ctx.beginPath();
      ctx.moveTo(0, worldBottom);
      ctx.lineTo(0, worldTop);
      ctx.stroke();
    }

    // Scale indicator (drawn in screen space by the caller after restoring transform)
    this._lastMajorSpacing = majorSpacing;
  }

  private _lastMajorSpacing = 1;

  get lastMajorSpacing(): number {
    return this._lastMajorSpacing;
  }

  /** Draw a screen-space scale label in the bottom-left corner.
   *  Expects the context transform to already include DPR scaling. */
  renderScaleLabel(ctx: CanvasRenderingContext2D, camera: Camera, cssHeight: number): void {
    const spacing = this._lastMajorSpacing;
    const pixelWidth = spacing * camera.getZoom();

    ctx.save();

    const x = 24;
    const y = cssHeight - 28;

    // Scale bar
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + pixelWidth, y);
    // End caps
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x, y + 5);
    ctx.moveTo(x + pixelWidth, y - 5);
    ctx.lineTo(x + pixelWidth, y + 5);
    ctx.stroke();

    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    let label: string;
    if (spacing >= 1) {
      label = `${spacing} m`;
    } else if (spacing >= 0.01) {
      label = `${(spacing * 100).toFixed(0)} cm`;
    } else {
      label = `${(spacing * 1000).toFixed(1)} mm`;
    }
    ctx.fillText(label, x + pixelWidth / 2, y - 10);

    ctx.restore();
  }

  private drawGridLines(
    ctx: CanvasRenderingContext2D,
    left: number, right: number,
    bottom: number, top: number,
    spacing: number,
  ): void {
    const startX = Math.floor(left / spacing) * spacing;
    const startY = Math.floor(bottom / spacing) * spacing;

    ctx.beginPath();

    // Vertical lines
    for (let x = startX; x <= right; x += spacing) {
      ctx.moveTo(x, bottom);
      ctx.lineTo(x, top);
    }

    // Horizontal lines
    for (let y = startY; y <= top; y += spacing) {
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
    }

    ctx.stroke();
  }

  /** Find a "nice" interval close to the target: 1, 2, 5, 10, 20, 50... */
  private niceInterval(target: number): number {
    const exponent = Math.floor(Math.log10(target));
    const fraction = target / Math.pow(10, exponent);
    let nice: number;
    if (fraction <= 1.5) nice = 1;
    else if (fraction <= 3.5) nice = 2;
    else if (fraction <= 7.5) nice = 5;
    else nice = 10;
    return nice * Math.pow(10, exponent);
  }
}
