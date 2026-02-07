import type { Primitive } from '../physics/primitives/Primitive';
import type { SimulationState } from './EventBus';

export class AppState {
  primitives = new Map<string, Primitive>();
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

  clearAll(): void {
    this.primitives.clear();
    this.selectedIds.clear();
    this.currentFrame = 0;
    this.totalFrames = 0;
  }
}
