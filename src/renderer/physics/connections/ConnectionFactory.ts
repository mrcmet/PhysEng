import type { Vec2Value } from 'planck';
import type { ConnectionType } from './Connection';
import { Connection } from './Connection';
import { RevoluteConnection } from './RevoluteConnection';
import { WeldConnection } from './WeldConnection';
import { SpringConnection } from './SpringConnection';
import { DamperConnection } from './DamperConnection';
import { generateId } from '../../core/IdGenerator';

const CONNECTION_COLORS: Record<ConnectionType, string> = {
  revolute: '#f59e0b',  // amber
  weld: '#6b7280',      // gray
  spring: '#22c55e',    // green
  damper: '#ef4444',    // red
};

export function createConnection(
  type: ConnectionType,
  bodyIdA: string,
  bodyIdB: string,
  localAnchorA: Vec2Value,
  localAnchorB: Vec2Value,
  distance: number,
): Connection {
  const base = {
    id: generateId(type),
    label: type.charAt(0).toUpperCase() + type.slice(1),
    bodyIdA,
    bodyIdB,
    localAnchorA: { x: localAnchorA.x, y: localAnchorA.y },
    localAnchorB: { x: localAnchorB.x, y: localAnchorB.y },
    color: CONNECTION_COLORS[type],
  };

  switch (type) {
    case 'revolute':
      return new RevoluteConnection({
        ...base,
        type: 'revolute',
        enableLimit: false,
        lowerAngle: 0,
        upperAngle: 0,
        enableMotor: false,
        motorSpeed: 0,
        maxMotorTorque: 0,
      });

    case 'weld':
      return new WeldConnection({
        ...base,
        type: 'weld',
        frequencyHz: 0,
        dampingRatio: 0,
      });

    case 'spring':
      return new SpringConnection({
        ...base,
        type: 'spring',
        restLength: distance,
        frequencyHz: 4.0,
        dampingRatio: 0.5,
      });

    case 'damper':
      return new DamperConnection({
        ...base,
        type: 'damper',
        restLength: distance,
        frequencyHz: 2.0,
        dampingRatio: 1.0,
      });

    default:
      throw new Error(`Unknown connection type: ${type}`);
  }
}
