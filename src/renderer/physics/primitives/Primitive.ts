import type { Vec2Value } from 'planck';

export type PrimitiveType = 'rectangle' | 'circle' | 'ground';
export type BodyType = 'dynamic' | 'static' | 'kinematic';

export interface PrimitiveProps {
  id: string;
  type: PrimitiveType;
  label: string;
  position: Vec2Value;
  angle: number;
  bodyType: BodyType;
  density: number;
  friction: number;
  restitution: number;
  linearDamping: number;
  angularDamping: number;
  fixedRotation: boolean;
  color: string;
}

export interface BodyState {
  position: Vec2Value;
  angle: number;
  linearVelocity: Vec2Value;
  angularVelocity: number;
}

export abstract class Primitive {
  readonly id: string;
  props: PrimitiveProps;

  constructor(props: PrimitiveProps) {
    this.id = props.id;
    this.props = props;
  }

  abstract getDisplayBounds(): { width: number; height: number; radius?: number };

  toSerializable(): Record<string, unknown> {
    return { ...this.props };
  }
}
