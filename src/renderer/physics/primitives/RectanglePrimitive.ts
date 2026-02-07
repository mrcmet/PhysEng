import { Primitive, PrimitiveProps } from './Primitive';

export interface RectangleProps extends PrimitiveProps {
  type: 'rectangle';
  width: number;   // meters
  height: number;  // meters
}

export class RectanglePrimitive extends Primitive {
  declare props: RectangleProps;

  constructor(props: RectangleProps) {
    super(props);
  }

  getDisplayBounds() {
    return { width: this.props.width, height: this.props.height };
  }

  toSerializable(): Record<string, unknown> {
    return { ...this.props };
  }
}
