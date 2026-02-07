import type { Camera } from './Camera';
import type { Vec2 } from '../core/EventBus';
import type { PrimitiveType } from '../physics/primitives/Primitive';

export class GhostRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    ghostPos: Vec2 | null,
    primitiveType: PrimitiveType | null,
  ): void {
    if (!ghostPos || !primitiveType) return;

    const zoom = camera.getZoom();

    ctx.save();
    ctx.translate(ghostPos.x, ghostPos.y);
    ctx.globalAlpha = 0.4;

    switch (primitiveType) {
      case 'rectangle': {
        const w = 1.0, h = 0.6;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        break;
      }
      case 'circle': {
        const r = 0.4;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'ground': {
        const halfW = 10;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.beginPath();
        ctx.moveTo(-halfW, 0);
        ctx.lineTo(halfW, 0);
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }
}
