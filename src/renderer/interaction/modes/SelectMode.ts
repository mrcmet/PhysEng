import * as planck from 'planck';
import type { InteractionMode } from './InteractionMode';
import type { Vec2 } from '../../core/EventBus';
import type { EventBus } from '../../core/EventBus';
import type { AppState } from '../../core/AppState';
import type { PhysicsWorld } from '../../physics/PhysicsWorld';
import type { SelectionManager } from '../SelectionManager';
import { HitTesting } from '../HitTesting';

export interface MarqueeRect {
  x1: number; y1: number;
  x2: number; y2: number;
}

export class SelectMode implements InteractionMode {
  readonly name = 'select';
  cursor = 'default';

  private hitTesting = new HitTesting();

  // Drag-move state (single or multi)
  private isMoving = false;
  private dragStartWorld: Vec2 = { x: 0, y: 0 };
  private dragStartPositions = new Map<string, Vec2>(); // id -> initial position

  // Marquee drag-select state
  private isMarquee = false;
  private marqueeStart: Vec2 = { x: 0, y: 0 };
  private marqueeEnd: Vec2 = { x: 0, y: 0 };
  private _marqueeRect: MarqueeRect | null = null;

  constructor(
    private appState: AppState,
    private physicsWorld: PhysicsWorld,
    private selectionManager: SelectionManager,
    private eventBus: EventBus,
  ) {}

  /** Expose marquee rect for rendering */
  getMarqueeRect(): MarqueeRect | null {
    return this._marqueeRect;
  }

  onMouseDown(worldPos: Vec2, _screenPos: Vec2, e: MouseEvent): void {
    if (e.button !== 0) return;

    const hit = this.hitTesting.hitTestPoint(worldPos, this.appState, this.physicsWorld);

    if (hit) {
      // Clicked on a body
      if (e.shiftKey) {
        // Shift+click toggles in/out of selection
        this.selectionManager.toggleSelection(hit.entityId);
      } else if (!this.appState.selectedIds.has(hit.entityId)) {
        // Clicked an unselected body — select only it
        this.selectionManager.select(hit.entityId);
      }
      // If already selected, keep current selection (allows multi-move)

      // Start drag-move for all selected bodies (editing mode only)
      if (this.appState.simulationState === 'editing' && this.appState.selectedIds.size > 0) {
        this.isMoving = true;
        this.dragStartWorld = { x: worldPos.x, y: worldPos.y };
        this.dragStartPositions.clear();
        for (const id of this.appState.selectedIds) {
          const prim = this.appState.getPrimitive(id);
          if (prim) {
            this.dragStartPositions.set(id, { x: prim.props.position.x, y: prim.props.position.y });
          }
        }
        this.cursor = 'grabbing';
      }
    } else {
      // Clicked empty space — start marquee selection
      if (!e.shiftKey) {
        this.selectionManager.clearSelection();
      }
      this.isMarquee = true;
      this.marqueeStart = { x: worldPos.x, y: worldPos.y };
      this.marqueeEnd = { x: worldPos.x, y: worldPos.y };
      this._marqueeRect = null;
      this.cursor = 'crosshair';
    }
  }

  onMouseMove(worldPos: Vec2, _screenPos: Vec2, _e: MouseEvent): void {
    if (this.isMoving) {
      const dx = worldPos.x - this.dragStartWorld.x;
      const dy = worldPos.y - this.dragStartWorld.y;

      for (const [id, startPos] of this.dragStartPositions) {
        const newX = startPos.x + dx;
        const newY = startPos.y + dy;

        const prim = this.appState.getPrimitive(id);
        if (prim) {
          prim.props.position = { x: newX, y: newY };
        }

        const body = this.physicsWorld.getBody(id);
        if (body) {
          body.setPosition(new planck.Vec2(newX, newY));
          body.setAwake(true);
        }
      }
    } else if (this.isMarquee) {
      this.marqueeEnd = { x: worldPos.x, y: worldPos.y };
      this._marqueeRect = {
        x1: this.marqueeStart.x,
        y1: this.marqueeStart.y,
        x2: this.marqueeEnd.x,
        y2: this.marqueeEnd.y,
      };
    }
  }

  onMouseUp(_worldPos: Vec2, _screenPos: Vec2, e: MouseEvent): void {
    if (this.isMoving) {
      this.isMoving = false;
      this.dragStartPositions.clear();
      this.cursor = 'default';
    }

    if (this.isMarquee) {
      // Select all bodies inside the marquee rectangle
      const ids = this.hitTesting.hitTestRect(
        this.marqueeStart.x, this.marqueeStart.y,
        this.marqueeEnd.x, this.marqueeEnd.y,
        this.appState, this.physicsWorld,
      );

      if (e.shiftKey) {
        for (const id of ids) {
          this.selectionManager.addToSelection(id);
        }
      } else {
        this.selectionManager.clearSelection();
        for (const id of ids) {
          this.selectionManager.addToSelection(id);
        }
      }

      this.isMarquee = false;
      this._marqueeRect = null;
      this.cursor = 'default';
    }
  }

  onKeyDown(e: KeyboardEvent): void {
    if ((e.key === 'Delete' || e.key === 'Backspace') && this.appState.simulationState === 'editing') {
      const ids = this.selectionManager.getSelectedIds();
      for (const id of ids) {
        this.physicsWorld.removePrimitive(id);
        this.appState.removePrimitive(id);
        this.eventBus.emit('primitive:deleted', { id });
      }
      this.selectionManager.clearSelection();
    }
  }

  onKeyUp(_e: KeyboardEvent): void {}

  activate(): void {
    this.cursor = 'default';
  }

  deactivate(): void {
    this.isMoving = false;
    this.isMarquee = false;
    this._marqueeRect = null;
    this.dragStartPositions.clear();
  }
}
