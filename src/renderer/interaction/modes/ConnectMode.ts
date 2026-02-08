import * as planck from 'planck';
import type { InteractionMode } from './InteractionMode';
import type { AppState } from '../../core/AppState';
import type { PhysicsWorld } from '../../physics/PhysicsWorld';
import type { SelectionManager } from '../SelectionManager';
import type { EventBus } from '../../core/EventBus';
import type { Camera } from '../../rendering/Camera';
import type { ConnectionType } from '../../physics/connections/Connection';
import { HitTesting } from '../HitTesting';
import { createConnection } from '../../physics/connections/ConnectionFactory';

export class ConnectMode implements InteractionMode {
  readonly name = 'connect';
  cursor = 'crosshair';

  private hitTesting = new HitTesting();
  private connectionType: ConnectionType = 'spring';
  private bodyIdA: string | null = null;
  private anchorWorldA: { x: number; y: number } | null = null;
  private hoverBodyId: string | null = null;
  private mouseWorldPos: { x: number; y: number } | null = null;
  private onComplete: () => void;

  constructor(
    private appState: AppState,
    private physicsWorld: PhysicsWorld,
    private selectionManager: SelectionManager,
    private eventBus: EventBus,
    private camera: Camera,
    onComplete: () => void,
  ) {
    this.onComplete = onComplete;
  }

  setConnectionType(type: ConnectionType): void {
    this.connectionType = type;
    this.resetState();
  }

  getConnectionType(): ConnectionType {
    return this.connectionType;
  }

  /** Get state for rendering feedback */
  getConnectState(): {
    bodyIdA: string | null;
    anchorWorldA: { x: number; y: number } | null;
    mouseWorldPos: { x: number; y: number } | null;
    hoverBodyId: string | null;
  } {
    return {
      bodyIdA: this.bodyIdA,
      anchorWorldA: this.anchorWorldA,
      mouseWorldPos: this.mouseWorldPos,
      hoverBodyId: this.hoverBodyId,
    };
  }

  onMouseDown(e: MouseEvent, worldPos: { x: number; y: number }): void {
    if (e.button !== 0) return;
    if (this.appState.simulationState !== 'editing') return;

    const hitResult = this.hitTesting.hitTestPoint(worldPos, this.appState, this.physicsWorld);
    if (!hitResult) return;

    const hitId = hitResult.entityId;

    if (!this.bodyIdA) {
      // First click: select body A
      this.bodyIdA = hitId;
      this.anchorWorldA = { x: worldPos.x, y: worldPos.y };
      this.selectionManager.select(hitId);
    } else if (hitId !== this.bodyIdA) {
      // Second click: select body B and create connection
      const bodyA = this.physicsWorld.getBody(this.bodyIdA);
      const bodyB = this.physicsWorld.getBody(hitId);
      if (!bodyA || !bodyB) {
        this.resetState();
        return;
      }

      // Convert world anchor points to local body coordinates
      const worldA = new planck.Vec2(this.anchorWorldA!.x, this.anchorWorldA!.y);
      const worldB = new planck.Vec2(worldPos.x, worldPos.y);
      const localA = bodyA.getLocalPoint(worldA);
      const localB = bodyB.getLocalPoint(worldB);

      // Calculate initial distance
      const dx = worldB.x - worldA.x;
      const dy = worldB.y - worldA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Create the connection
      const connection = createConnection(
        this.connectionType,
        this.bodyIdA,
        hitId,
        { x: localA.x, y: localA.y },
        { x: localB.x, y: localB.y },
        distance,
      );

      this.appState.addConnection(connection);
      this.physicsWorld.addConnection(connection);
      this.eventBus.emit('connection:created', { id: connection.id });

      this.selectionManager.select(connection.id);
      this.resetState();
      this.onComplete();
    }
  }

  onMouseMove(_e: MouseEvent, worldPos: { x: number; y: number }): void {
    this.mouseWorldPos = worldPos;

    // Hit test for hover feedback
    const hitResult = this.hitTesting.hitTestPoint(worldPos, this.appState, this.physicsWorld);
    this.hoverBodyId = hitResult ? hitResult.entityId : null;
  }

  onMouseUp(_e: MouseEvent, _worldPos: { x: number; y: number }): void {
    // Click-based, not drag-based
  }

  onKeyDown(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'Escape') {
      this.resetState();
      this.onComplete();
    }
  }

  onKeyUp(_e: KeyboardEvent): void {}

  activate(): void {
    this.cursor = 'crosshair';
    this.resetState();
  }

  deactivate(): void {
    this.resetState();
  }

  private resetState(): void {
    this.bodyIdA = null;
    this.anchorWorldA = null;
    this.hoverBodyId = null;
    this.mouseWorldPos = null;
  }
}
