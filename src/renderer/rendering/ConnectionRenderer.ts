import type { Camera } from './Camera';
import type { AppState } from '../core/AppState';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { Connection } from '../physics/connections/Connection';

export class ConnectionRenderer {
  render(ctx: CanvasRenderingContext2D, camera: Camera, appState: AppState, physicsWorld: PhysicsWorld): void {
    const zoom = camera.getZoom();
    const lineWidth = Math.max(1.5 / zoom, 0.01);

    for (const [id, connection] of appState.connections) {
      const anchors = physicsWorld.getConnectionAnchors(id);
      if (!anchors) continue;

      const { worldA, worldB } = anchors;
      const isSelected = appState.selectedIds.has(id);

      ctx.save();

      if (isSelected) {
        // Draw selection highlight
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = lineWidth * 2.5;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(worldA.x, worldA.y);
        ctx.lineTo(worldB.x, worldB.y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      switch (connection.props.type) {
        case 'spring':
          this.drawSpring(ctx, worldA.x, worldA.y, worldB.x, worldB.y, connection, lineWidth);
          break;
        case 'damper':
          this.drawDamper(ctx, worldA.x, worldA.y, worldB.x, worldB.y, connection, lineWidth);
          break;
        case 'revolute':
          this.drawRevolute(ctx, worldA.x, worldA.y, worldB.x, worldB.y, connection, lineWidth);
          break;
        case 'weld':
          this.drawWeld(ctx, worldA.x, worldA.y, worldB.x, worldB.y, connection, lineWidth);
          break;
      }

      // Draw anchor dots
      const dotRadius = Math.max(3 / zoom, 0.02);
      ctx.fillStyle = connection.props.color;
      ctx.beginPath();
      ctx.arc(worldA.x, worldA.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(worldB.x, worldB.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private drawSpring(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number, x2: number, y2: number,
    conn: Connection, lineWidth: number,
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < 0.001) return;

    const coils = 8;
    const amplitude = Math.max(length * 0.08, 0.03);

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(Math.atan2(dy, dx));

    ctx.strokeStyle = conn.props.color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Lead-in line (10% of length)
    const leadIn = length * 0.1;
    const leadOut = length * 0.9;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(leadIn, 0);

    // Zigzag coils
    const coilLen = leadOut - leadIn;
    const segLen = coilLen / (coils * 2);

    for (let i = 0; i < coils * 2; i++) {
      const x = leadIn + segLen * (i + 1);
      const y = (i % 2 === 0 ? amplitude : -amplitude);
      ctx.lineTo(x, y);
    }

    // Lead-out line
    ctx.lineTo(length, 0);
    ctx.stroke();

    ctx.restore();
  }

  private drawDamper(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number, x2: number, y2: number,
    conn: Connection, lineWidth: number,
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < 0.001) return;

    const pistonWidth = Math.max(length * 0.06, 0.02);

    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(Math.atan2(dy, dx));

    ctx.strokeStyle = conn.props.color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    // Line from A to cylinder start (40% of length)
    const cylStart = length * 0.3;
    const cylEnd = length * 0.7;
    const pistonEnd = length * 0.55;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cylStart, 0);
    ctx.stroke();

    // Cylinder body (open rectangle)
    ctx.beginPath();
    ctx.moveTo(cylStart, -pistonWidth);
    ctx.lineTo(cylEnd, -pistonWidth);
    ctx.lineTo(cylEnd, pistonWidth);
    ctx.lineTo(cylStart, pistonWidth);
    ctx.stroke();

    // Piston rod (line from B side into cylinder)
    ctx.beginPath();
    ctx.moveTo(length, 0);
    ctx.lineTo(pistonEnd, 0);
    ctx.stroke();

    // Piston head (vertical line inside cylinder)
    ctx.beginPath();
    ctx.moveTo(pistonEnd, -pistonWidth * 0.8);
    ctx.lineTo(pistonEnd, pistonWidth * 0.8);
    ctx.stroke();

    ctx.restore();
  }

  private drawRevolute(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number, x2: number, y2: number,
    conn: Connection, lineWidth: number,
  ): void {
    // Draw a line between anchors with a circle at the pivot
    ctx.strokeStyle = conn.props.color;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Pivot circle at midpoint (revolute anchors overlap at the same world point)
    const radius = Math.max(4 / (lineWidth * 100), 0.04);
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawWeld(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number, x2: number, y2: number,
    conn: Connection, lineWidth: number,
  ): void {
    // Draw a thick solid line between anchors
    ctx.strokeStyle = conn.props.color;
    ctx.lineWidth = lineWidth * 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Draw an X at the weld point
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const s = Math.max(4 / (lineWidth * 100), 0.04);

    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(cx - s, cy - s);
    ctx.lineTo(cx + s, cy + s);
    ctx.moveTo(cx + s, cy - s);
    ctx.lineTo(cx - s, cy + s);
    ctx.stroke();
  }
}
