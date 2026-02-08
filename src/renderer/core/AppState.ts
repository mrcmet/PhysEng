import type { Primitive } from '../physics/primitives/Primitive';
import type { Connection } from '../physics/connections/Connection';
import type { SimulationState } from './EventBus';

export class AppState {
  primitives = new Map<string, Primitive>();
  connections = new Map<string, Connection>();
  selectedIds = new Set<string>();
  simulationState: SimulationState = 'editing';
  simulationSpeed = 1.0;
  currentFrame = 0;
  totalFrames = 0;

  addPrimitive(primitive: Primitive): void {
    this.primitives.set(primitive.id, primitive);
  }

  removePrimitive(id: string): void {
    this.primitives.delete(id);
    this.selectedIds.delete(id);
  }

  getPrimitive(id: string): Primitive | undefined {
    return this.primitives.get(id);
  }

  addConnection(connection: Connection): void {
    this.connections.set(connection.id, connection);
  }

  removeConnection(id: string): void {
    this.connections.delete(id);
    this.selectedIds.delete(id);
  }

  getConnection(id: string): Connection | undefined {
    return this.connections.get(id);
  }

  /** Get all connections involving a specific body */
  getConnectionsForBody(bodyId: string): Connection[] {
    const result: Connection[] = [];
    for (const conn of this.connections.values()) {
      if (conn.props.bodyIdA === bodyId || conn.props.bodyIdB === bodyId) {
        result.push(conn);
      }
    }
    return result;
  }

  clearAll(): void {
    this.primitives.clear();
    this.connections.clear();
    this.selectedIds.clear();
    this.currentFrame = 0;
    this.totalFrames = 0;
  }
}
