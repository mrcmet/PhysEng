import type { InteractionMode } from './InteractionMode';
import type { Vec2 } from '../../core/EventBus';
import type { EventBus } from '../../core/EventBus';
import type { AppState } from '../../core/AppState';
import type { PhysicsWorld } from '../../physics/PhysicsWorld';
import type { PrimitiveType } from '../../physics/primitives/Primitive';
import type { SelectionManager } from '../SelectionManager';
import { createPrimitive } from '../../physics/primitives/PrimitiveFactory';

export class PlaceMode implements InteractionMode {
  readonly name = 'place';
  cursor = 'crosshair';

  private primitiveType: PrimitiveType = 'rectangle';
  private ghostPos: Vec2 | null = null;
  private onComplete: () => void;

  constructor(
    private appState: AppState,
    private physicsWorld: PhysicsWorld,
    private selectionManager: SelectionManager,
    private eventBus: EventBus,
    onComplete: () => void,
  ) {
    this.onComplete = onComplete;
  }

  setPrimitiveType(type: PrimitiveType): void {
    this.primitiveType = type;
  }

  getGhostPos(): Vec2 | null {
    return this.ghostPos;
  }

  getPrimitiveType(): PrimitiveType {
    return this.primitiveType;
  }

  onMouseDown(worldPos: Vec2, _screenPos: Vec2, e: MouseEvent): void {
    if (e.button !== 0) return;

    // Place the primitive
    const primitive = createPrimitive(this.primitiveType, worldPos);
    this.appState.addPrimitive(primitive);
    this.physicsWorld.addPrimitive(primitive);
    this.eventBus.emit('primitive:created', { id: primitive.id });
    this.selectionManager.select(primitive.id);

    // Return to select mode
    this.ghostPos = null;
    this.onComplete();
  }

  onMouseMove(worldPos: Vec2, _screenPos: Vec2, _e: MouseEvent): void {
    this.ghostPos = { x: worldPos.x, y: worldPos.y };
  }

  onMouseUp(_worldPos: Vec2, _screenPos: Vec2, _e: MouseEvent): void {}

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.ghostPos = null;
      this.onComplete();
    }
  }

  onKeyUp(_e: KeyboardEvent): void {}
  activate(): void { this.ghostPos = null; }
  deactivate(): void { this.ghostPos = null; }
}
