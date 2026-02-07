import { Primitive, PrimitiveProps } from './Primitive';

export interface GroundProps extends PrimitiveProps {
  type: 'ground';
  bodyType: 'static';
  width: number;  // visual width in meters
}

export class GroundPrimitive extends Primitive {
  declare props: GroundProps;

  constructor(props: GroundProps) {
    super({ ...props, bodyType: 'static' });
  }

  getDisplayBounds() {
    return { width: this.props.width, height: 0.05 };
  }

  toSerializable(): Record<string, unknown> {
    return { ...this.props };
  }
}
