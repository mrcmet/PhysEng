import type { Vec2Value } from 'planck';
import type { PrimitiveType } from './Primitive';
import { Primitive } from './Primitive';
import { RectanglePrimitive } from './RectanglePrimitive';
import { CirclePrimitive } from './CirclePrimitive';
import { GroundPrimitive } from './GroundPrimitive';
import { generateId } from '../../core/IdGenerator';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
let colorIndex = 0;

function nextColor(): string {
  const color = COLORS[colorIndex % COLORS.length];
  colorIndex++;
  return color;
}

export function createPrimitive(type: PrimitiveType, worldPos: Vec2Value): Primitive {
  switch (type) {
    case 'rectangle':
      return new RectanglePrimitive({
        id: generateId('rect'),
        type: 'rectangle',
        label: 'Rectangle',
        position: { x: worldPos.x, y: worldPos.y },
        angle: 0,
        bodyType: 'dynamic',
        density: 1.0,
        friction: 0.3,
        restitution: 0.2,
        linearDamping: 0,
        angularDamping: 0,
        fixedRotation: false,
        color: nextColor(),
        width: 1.0,
        height: 0.6,
      });

    case 'circle':
      return new CirclePrimitive({
        id: generateId('circle'),
        type: 'circle',
        label: 'Circle',
        position: { x: worldPos.x, y: worldPos.y },
        angle: 0,
        bodyType: 'dynamic',
        density: 1.0,
        friction: 0.3,
        restitution: 0.5,
        linearDamping: 0,
        angularDamping: 0,
        fixedRotation: false,
        color: nextColor(),
        radius: 0.4,
      });

    case 'ground':
      return new GroundPrimitive({
        id: generateId('ground'),
        type: 'ground',
        label: 'Ground',
        position: { x: worldPos.x, y: worldPos.y },
        angle: 0,
        bodyType: 'static',
        density: 0,
        friction: 0.5,
        restitution: 0.1,
        linearDamping: 0,
        angularDamping: 0,
        fixedRotation: true,
        color: '#64748b',
        width: 20,
      });

    default:
      throw new Error(`Unknown primitive type: ${type}`);
  }
}
