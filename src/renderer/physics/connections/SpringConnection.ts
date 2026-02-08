import { Connection, ConnectionProps } from './Connection';

export interface SpringConnectionProps extends ConnectionProps {
  type: 'spring';
  restLength: number;    // meters (0 = auto-compute from initial distance)
  frequencyHz: number;   // oscillation frequency (higher = stiffer)
  dampingRatio: number;  // 0 = no damping, 1 = critically damped
}

export class SpringConnection extends Connection {
  declare props: SpringConnectionProps;

  constructor(props: SpringConnectionProps) {
    super(props);
  }

  toSerializable(): Record<string, unknown> {
    return { ...this.props };
  }
}
