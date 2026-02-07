import { Primitive, PrimitiveProps } from './Primitive';

export interface CircleProps extends PrimitiveProps {
  type: 'circle';
  radius: number;  // meters
}

export class CirclePrimitive extends Primitive {
  declare props: CircleProps;

  constructor(props: CircleProps) {
    super(props);
  }

  getDisplayBounds() {
    const d = this.props.radius * 2;
    return { width: d, height: d, radius: this.props.radius };
  }

  toSerializable(): Record<string, unknown> {
    return { ...this.props };
  }
}
