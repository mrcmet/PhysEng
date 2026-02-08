import { Connection, ConnectionProps } from './Connection';

export interface RevoluteConnectionProps extends ConnectionProps {
  type: 'revolute';
  enableLimit: boolean;
  lowerAngle: number;  // radians
  upperAngle: number;  // radians
  enableMotor: boolean;
  motorSpeed: number;  // rad/s
  maxMotorTorque: number;
}

export class RevoluteConnection extends Connection {
  declare props: RevoluteConnectionProps;

  constructor(props: RevoluteConnectionProps) {
    super(props);
  }

  toSerializable(): Record<string, unknown> {
    return { ...this.props };
  }
}
