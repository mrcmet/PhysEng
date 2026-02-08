import { Connection, ConnectionProps } from './Connection';

export interface DamperConnectionProps extends ConnectionProps {
  type: 'damper';
  restLength: number;    // meters (0 = auto-compute from initial distance)
  frequencyHz: number;   // low frequency for damper behavior
  dampingRatio: number;  // >= 1.0 for overdamped behavior
}

export class DamperConnection extends Connection {
  declare props: DamperConnectionProps;

  constructor(props: DamperConnectionProps) {
    super(props);
  }

  toSerializable(): Record<string, unknown> {
    return { ...this.props };
  }
}
