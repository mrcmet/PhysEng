import type { Camera } from './Camera';
import type { AppState } from '../core/AppState';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import { RectanglePrimitive } from '../physics/primitives/RectanglePrimitive';
import { CirclePrimitive } from '../physics/primitives/CirclePrimitive';
import { GroundPrimitive } from '../physics/primitives/GroundPrimitive';

export class PrimitiveRenderer {
  render(ctx: CanvasRenderingContext2D, camera: Camera, appState: AppState, physicsWorld: PhysicsWorld): void {
    const zoom = camera.getZoom();

    for (const [id, primitive] of appState.primitives) {
      const bodyState = physicsWorld.getBodyState(id);
      if (!bodyState) continue;

      const { position, angle } = bodyState;
      const isSelected = appState.selectedIds.has(id);

      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate(angle);

      if (primitive instanceof RectanglePrimitive) {
        this.drawRect(ctx, primitive, isSelected, zoom);
      } else if (primitive instanceof CirclePrimitive) {
        this.drawCircle(ctx, primitive, isSelected, zoom);
      } else if (primitive instanceof GroundPrimitive) {
        this.drawGround(ctx, primitive, isSelected, zoom);
      }

      ctx.restore();
    }
  }

  private drawRect(ctx: CanvasRenderingContext2D, prim: RectanglePrimitive, selected: boolean, zoom: number): void {
    const { width, height, color } = prim.props;
    const hw = width / 2;
    const hh = height / 2;

    ctx.fillStyle = color + 'cc';
    ctx.fillRect(-hw, -hh, width, height);

    ctx.strokeStyle = selected ? '#fbbf24' : color;
    ctx.lineWidth = (selected ? 3 : 1.5) / zoom;
    ctx.strokeRect(-hw, -hh, width, height);

    // Center-of-mass dot
    ctx.fillStyle = '#ffffff88';
    ctx.beginPath();
    ctx.arc(0, 0, 3 / zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCircle(ctx: CanvasRenderingContext2D, prim: CirclePrimitive, selected: boolean, zoom: number): void {
    const { radius, color } = prim.props;

    ctx.fillStyle = color + 'cc';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = selected ? '#fbbf24' : color;
    ctx.lineWidth = (selected ? 3 : 1.5) / zoom;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Radius line to show rotation
    ctx.strokeStyle = '#ffffff66';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();

    // Center-of-mass dot
    ctx.fillStyle = '#ffffff88';
    ctx.beginPath();
    ctx.arc(0, 0, 3 / zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawGround(ctx: CanvasRenderingContext2D, prim: GroundPrimitive, selected: boolean, zoom: number): void {
    const halfW = prim.props.width / 2;
    const color = prim.props.color;

    // Ground surface line
    ctx.strokeStyle = selected ? '#fbbf24' : color;
    ctx.lineWidth = (selected ? 3 : 2) / zoom;
    ctx.beginPath();
    ctx.moveTo(-halfW, 0);
    ctx.lineTo(halfW, 0);
    ctx.stroke();

    // Hatch marks below the surface
    const hatchSpacing = 0.3;
    const hatchLen = 0.15;
    ctx.strokeStyle = color + '88';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    for (let x = -halfW; x <= halfW; x += hatchSpacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x - hatchLen, -hatchLen);
    }
    ctx.stroke();
  }
}
