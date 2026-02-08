import { Connection, ConnectionProps } from './Connection';

export interface WeldConnectionProps extends ConnectionProps {
  type: 'weld';
  frequencyHz: number;   // 0 = perfectly rigid
  dampingRatio: number;  // 0..1
}

export class WeldConnection extends Connection {
  declare props: WeldConnectionProps;

  constructor(props: WeldConnectionProps) {
    super(props);
  }

  toSerializable(): Record<string, unknown> {
    return { ...this.props };
  }
}
