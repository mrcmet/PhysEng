import type { Vec2 } from '../../core/EventBus';

export interface InteractionMode {
  name: string;
  cursor: string;
  onMouseDown(worldPos: Vec2, screenPos: Vec2, e: MouseEvent): void;
  onMouseMove(worldPos: Vec2, screenPos: Vec2, e: MouseEvent): void;
  onMouseUp(worldPos: Vec2, screenPos: Vec2, e: MouseEvent): void;
  onKeyDown(e: KeyboardEvent): void;
  onKeyUp(e: KeyboardEvent): void;
  activate(): void;
  deactivate(): void;
}
