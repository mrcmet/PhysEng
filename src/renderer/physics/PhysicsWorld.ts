import * as planck from 'planck';
import { PhysicsConfig } from './PhysicsConfig';
import { Primitive, BodyState } from './primitives/Primitive';
import { RectanglePrimitive } from './primitives/RectanglePrimitive';
import { CirclePrimitive } from './primitives/CirclePrimitive';
import { GroundPrimitive } from './primitives/GroundPrimitive';
import type { Connection } from './connections/Connection';
import { RevoluteConnection } from './connections/RevoluteConnection';
import { WeldConnection } from './connections/WeldConnection';
import { SpringConnection } from './connections/SpringConnection';
import { DamperConnection } from './connections/DamperConnection';

export class PhysicsWorld {
  private world: planck.World;
  private bodyMap = new Map<string, planck.Body>();
  private primitiveMap = new Map<string, Primitive>();
  private jointMap = new Map<string, planck.Joint>();
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

  addConnection(connection: Connection): void {
    const bodyA = this.bodyMap.get(connection.props.bodyIdA);
    const bodyB = this.bodyMap.get(connection.props.bodyIdB);
    if (!bodyA || !bodyB) return;

    const anchorA = new planck.Vec2(connection.props.localAnchorA.x, connection.props.localAnchorA.y);
    const anchorB = new planck.Vec2(connection.props.localAnchorB.x, connection.props.localAnchorB.y);

    let joint: planck.Joint;

    if (connection instanceof RevoluteConnection) {
      const worldAnchor = bodyA.getWorldPoint(anchorA);
      joint = this.world.createJoint(new planck.RevoluteJoint({
        enableLimit: connection.props.enableLimit,
        lowerAngle: connection.props.lowerAngle,
        upperAngle: connection.props.upperAngle,
        enableMotor: connection.props.enableMotor,
        motorSpeed: connection.props.motorSpeed,
        maxMotorTorque: connection.props.maxMotorTorque,
      }, bodyA, bodyB, worldAnchor))!;

    } else if (connection instanceof WeldConnection) {
      const worldAnchor = bodyA.getWorldPoint(anchorA);
      joint = this.world.createJoint(new planck.WeldJoint({
        frequencyHz: connection.props.frequencyHz,
        dampingRatio: connection.props.dampingRatio,
      }, bodyA, bodyB, worldAnchor))!;

    } else if (connection instanceof SpringConnection) {
      const worldA = bodyA.getWorldPoint(anchorA);
      const worldB = bodyB.getWorldPoint(anchorB);
      joint = this.world.createJoint(new planck.DistanceJoint({
        frequencyHz: connection.props.frequencyHz,
        dampingRatio: connection.props.dampingRatio,
        length: connection.props.restLength,
      }, bodyA, bodyB, worldA, worldB))!;

    } else if (connection instanceof DamperConnection) {
      const worldA = bodyA.getWorldPoint(anchorA);
      const worldB = bodyB.getWorldPoint(anchorB);
      joint = this.world.createJoint(new planck.DistanceJoint({
        frequencyHz: connection.props.frequencyHz,
        dampingRatio: connection.props.dampingRatio,
        length: connection.props.restLength,
      }, bodyA, bodyB, worldA, worldB))!;

    } else {
      return;
    }

    this.jointMap.set(connection.id, joint);
  }

  removeConnection(id: string): void {
    const joint = this.jointMap.get(id);
    if (joint) {
      this.world.destroyJoint(joint);
      this.jointMap.delete(id);
    }
  }

  getJoint(id: string): planck.Joint | undefined {
    return this.jointMap.get(id);
  }

  /** Get world-space anchor positions for a connection */
  getConnectionAnchors(id: string): { worldA: planck.Vec2; worldB: planck.Vec2 } | null {
    const joint = this.jointMap.get(id);
    if (!joint) return null;
    const anchorA = joint.getAnchorA();
    const anchorB = joint.getAnchorB();
    return { worldA: anchorA, worldB: anchorB };
  }

  reset(): void {
    // Destroy all joints first (must happen before bodies)
    for (const [, joint] of this.jointMap) {
      this.world.destroyJoint(joint);
    }
    this.jointMap.clear();

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
