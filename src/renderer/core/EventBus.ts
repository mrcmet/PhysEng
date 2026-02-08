import type { PrimitiveType } from '../physics/primitives/Primitive';
import type { ConnectionType } from '../physics/connections/Connection';

export interface Vec2 {
  x: number;
  y: number;
}

export type SimulationState = 'editing' | 'playing' | 'paused';

export interface EventMap {
  // Primitive lifecycle
  'primitive:place-request': { type: PrimitiveType; worldPos: Vec2 };
  'primitive:created': { id: string };
  'primitive:deleted': { id: string };
  'primitive:property-changed': { id: string; key: string; value: unknown };

  // Connection lifecycle
  'connection:created': { id: string };
  'connection:deleted': { id: string };
  'connection:property-changed': { id: string; key: string; value: unknown };

  // Selection
  'selection:changed': { selected: string[] };

  // Simulation control
  'simulation:play': void;
  'simulation:pause': void;
  'simulation:step-forward': void;
  'simulation:step-backward': void;
  'simulation:reset': void;
  'simulation:speed-changed': { speed: number };
  'simulation:state-changed': { state: SimulationState };

  // Camera
  'camera:changed': void;
  'canvas:resized': { width: number; height: number };
}

type Handler<T> = (data: T) => void;

export class EventBus {
  private handlers = new Map<string, Set<Handler<any>>>();

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
    if (!this.handlers.has(event as string)) {
      this.handlers.set(event as string, new Set());
    }
    this.handlers.get(event as string)!.add(handler);
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
    this.handlers.get(event as string)?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.handlers.get(event as string)?.forEach((h) => h(data));
  }
}
