import * as planck from 'planck';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { AppState } from '../core/AppState';
import type { Vec2 } from '../core/EventBus';

export interface HitResult {
  entityId: string;
  worldPoint: Vec2;
}

export class HitTesting {
  /** Find the topmost primitive under a world-space point */
  hitTestPoint(worldPos: Vec2, appState: AppState, physicsWorld: PhysicsWorld): HitResult | null {
    const testPoint = new planck.Vec2(worldPos.x, worldPos.y);
    const pw = physicsWorld.getPlanckWorld();

    // Query a small AABB around the point
    const d = 0.01;
    const aabb = new planck.AABB(
      new planck.Vec2(worldPos.x - d, worldPos.y - d),
      new planck.Vec2(worldPos.x + d, worldPos.y + d),
    );

    let hit: HitResult | null = null;

    pw.queryAABB(aabb, (fixture: planck.Fixture) => {
      if (fixture.testPoint(testPoint)) {
        // Find which primitive this body belongs to
        const body = fixture.getBody();
        for (const [id] of appState.primitives) {
          if (physicsWorld.getBody(id) === body) {
            hit = { entityId: id, worldPoint: { x: worldPos.x, y: worldPos.y } };
            return false; // stop query
          }
        }
      }
      return true; // continue query
    });

    // Edge shapes (ground) don't respond to testPoint — use distance check
    if (!hit) {
      hit = this.hitTestEdges(worldPos, appState, physicsWorld);
    }

    return hit;
  }

  /** Find all primitives whose bodies overlap a world-space rectangle */
  hitTestRect(minX: number, minY: number, maxX: number, maxY: number, appState: AppState, physicsWorld: PhysicsWorld): string[] {
    const pw = physicsWorld.getPlanckWorld();
    const aabb = new planck.AABB(
      new planck.Vec2(Math.min(minX, maxX), Math.min(minY, maxY)),
      new planck.Vec2(Math.max(minX, maxX), Math.max(minY, maxY)),
    );

    const hitBodies = new Set<planck.Body>();

    pw.queryAABB(aabb, (fixture: planck.Fixture) => {
      hitBodies.add(fixture.getBody());
      return true; // continue
    });

    const ids: string[] = [];
    for (const [id] of appState.primitives) {
      const body = physicsWorld.getBody(id);
      if (body && hitBodies.has(body)) {
        ids.push(id);
      }
    }

    // Also check ground edges by center position
    for (const [id, primitive] of appState.primitives) {
      if (primitive.props.type !== 'ground' || ids.includes(id)) continue;
      const body = physicsWorld.getBody(id);
      if (!body) continue;
      const pos = body.getPosition();
      const lo = aabb.lowerBound;
      const hi = aabb.upperBound;
      if (pos.x >= lo.x && pos.x <= hi.x && pos.y >= lo.y && pos.y <= hi.y) {
        ids.push(id);
      }
    }

    return ids;
  }

  /** Special hit test for edge shapes (ground) using proximity */
  private hitTestEdges(worldPos: Vec2, appState: AppState, physicsWorld: PhysicsWorld): HitResult | null {
    const threshold = 0.15; // meters — click tolerance for edges

    for (const [id, primitive] of appState.primitives) {
      if (primitive.props.type !== 'ground') continue;

      const body = physicsWorld.getBody(id);
      if (!body) continue;

      const pos = body.getPosition();
      // Ground is a horizontal edge at body position
      const halfW = (primitive as any).props.width / 2;
      const localX = worldPos.x - pos.x;
      const localY = worldPos.y - pos.y;

      if (localX >= -halfW && localX <= halfW && Math.abs(localY) < threshold) {
        return { entityId: id, worldPoint: { x: worldPos.x, y: worldPos.y } };
      }
    }

    return null;
  }
}
