import type { Vec2Value } from 'planck';

export type ConnectionType = 'revolute' | 'weld' | 'spring' | 'damper';

export interface ConnectionProps {
  id: string;
  type: ConnectionType;
  label: string;
  bodyIdA: string;
  bodyIdB: string;
  /** Local anchor on body A (body-local coordinates) */
  localAnchorA: Vec2Value;
  /** Local anchor on body B (body-local coordinates) */
  localAnchorB: Vec2Value;
  color: string;
}

export abstract class Connection {
  readonly id: string;
  props: ConnectionProps;

  constructor(props: ConnectionProps) {
    this.id = props.id;
    this.props = props;
  }

  toSerializable(): Record<string, unknown> {
    return { ...this.props };
  }
}
