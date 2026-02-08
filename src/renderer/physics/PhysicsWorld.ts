import * as planck from 'planck';
import { PhysicsConfig } from './PhysicsConfig';
import { Primitive, BodyState } from './primitives/Primitive';
import { RectanglePrimitive } from './primitives/RectanglePrimitive';
import { CirclePrimitive } from './primitives/CirclePrimitive';
import { GroundPrimitive } from './primitives/GroundPrimitive';

export class PhysicsWorld {
  private world: planck.World;
  private bodyMap = new Map<string, planck.Body>();
  private primitiveMap = new Map<string, Primitive>();
  private fixedTimestep: number;

  constructor() {
    this.fixedTimestep = PhysicsConfig.timestepDefault;
    this.world = new planck.World({
      gravity: new planck.Vec2(PhysicsConfig.gravity.x, PhysicsConfig.gravity.y),
    });
  }

  getFixedTimestep(): number {
    return this.fixedTimestep;
  }

  setFixedTimestep(dt: number): void {
    this.fixedTimestep = Math.max(PhysicsConfig.timestepMin, Math.min(PhysicsConfig.timestepMax, dt));
  }

  getGravity(): { x: number; y: number } {
    const g = this.world.getGravity();
    return { x: g.x, y: g.y };
  }

  setGravity(x: number, y: number): void {
    this.world.setGravity(new planck.Vec2(x, y));
  }

  addPrimitive(primitive: Primitive): void {
    const props = primitive.props;

    const bodyDef: planck.BodyDef = {
      type: props.bodyType,
      position: new planck.Vec2(props.position.x, props.position.y),
      angle: props.angle,
      linearDamping: props.linearDamping,
      angularDamping: props.angularDamping,
      fixedRotation: props.fixedRotation,
    };

    const body = this.world.createBody(bodyDef);

    let shape: planck.Shape;
    if (primitive instanceof RectanglePrimitive) {
      shape = new planck.Box(primitive.props.width / 2, primitive.props.height / 2);
    } else if (primitive instanceof CirclePrimitive) {
      shape = new planck.Circle(primitive.props.radius);
    } else if (primitive instanceof GroundPrimitive) {
      const halfW = primitive.props.width / 2;
      shape = new planck.Edge(
        new planck.Vec2(-halfW, 0),
        new planck.Vec2(halfW, 0),
      );
    } else {
      throw new Error(`Unknown primitive class`);
    }

    body.createFixture({
      shape,
      density: props.density,
      friction: props.friction,
      restitution: props.restitution,
    });

    this.bodyMap.set(primitive.id, body);
    this.primitiveMap.set(primitive.id, primitive);
  }

  removePrimitive(id: string): void {
    const body = this.bodyMap.get(id);
    if (body) {
      this.world.destroyBody(body);
      this.bodyMap.delete(id);
      this.primitiveMap.delete(id);
    }
  }

  step(): void {
    this.world.step(this.fixedTimestep, PhysicsConfig.velocityIterations, PhysicsConfig.positionIterations);
  }

  getBodyState(id: string): BodyState | null {
    const body = this.bodyMap.get(id);
    if (!body) return null;
    const pos = body.getPosition();
    const vel = body.getLinearVelocity();
    return {
      position: { x: pos.x, y: pos.y },
      angle: body.getAngle(),
      linearVelocity: { x: vel.x, y: vel.y },
      angularVelocity: body.getAngularVelocity(),
    };
  }

  getAllBodyStates(): Map<string, BodyState> {
    const states = new Map<string, BodyState>();
    for (const [id] of this.bodyMap) {
      const state = this.getBodyState(id);
      if (state) states.set(id, state);
    }
    return states;
  }

  getBody(id: string): planck.Body | undefined {
    return this.bodyMap.get(id);
  }

  getPlanckWorld(): planck.World {
    return this.world;
  }

  reset(): void {
    // Destroy all bodies
    for (const [, body] of this.bodyMap) {
      this.world.destroyBody(body);
    }
    this.bodyMap.clear();
    this.primitiveMap.clear();

    // Recreate world
    this.world = new planck.World({
      gravity: new planck.Vec2(PhysicsConfig.gravity.x, PhysicsConfig.gravity.y),
    });
  }
}
