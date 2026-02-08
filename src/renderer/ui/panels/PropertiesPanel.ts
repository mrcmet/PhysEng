import * as planck from 'planck';
import type { EventBus } from '../../core/EventBus';
import type { AppState } from '../../core/AppState';
import type { PhysicsWorld } from '../../physics/PhysicsWorld';
import type { Primitive } from '../../physics/primitives/Primitive';
import type { RectanglePrimitive } from '../../physics/primitives/RectanglePrimitive';
import type { CirclePrimitive } from '../../physics/primitives/CirclePrimitive';
import type { GroundPrimitive } from '../../physics/primitives/GroundPrimitive';

export class PropertiesPanel {
  private container: HTMLElement;
  private appState: AppState;
  private physicsWorld: PhysicsWorld;
  private eventBus: EventBus;

  constructor(container: HTMLElement, appState: AppState, physicsWorld: PhysicsWorld, eventBus: EventBus) {
    this.container = container;
    this.appState = appState;
    this.physicsWorld = physicsWorld;
    this.eventBus = eventBus;

    this.eventBus.on('selection:changed', () => this.refresh());
    this.showEmpty();
  }

  refresh(): void {
    const ids = Array.from(this.appState.selectedIds);
    if (ids.length === 0) {
      this.showEmpty();
    } else if (ids.length === 1) {
      const prim = this.appState.getPrimitive(ids[0]);
      if (prim) this.showPrimitive(prim);
      else this.showEmpty();
    } else {
      this.showMulti(ids.length);
    }
  }

  private showEmpty(): void {
    this.container.innerHTML = `
      <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Properties</h3>
      <p class="text-xs text-gray-500">No selection</p>
    `;
  }

  private showMulti(count: number): void {
    this.container.innerHTML = `
      <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Properties</h3>
      <p class="text-xs text-gray-500">${count} objects selected</p>
    `;
  }

  private showPrimitive(prim: Primitive): void {
    const p = prim.props;
    const editing = this.appState.simulationState === 'editing';
    const dis = editing ? '' : 'disabled';

    let shapeFields = '';
    if (p.type === 'rectangle') {
      const rp = prim as unknown as RectanglePrimitive;
      shapeFields = `
        ${this.numField('Width', 'width', rp.props.width, 0.01, 100, 0.1, dis)}
        ${this.numField('Height', 'height', rp.props.height, 0.01, 100, 0.1, dis)}
      `;
    } else if (p.type === 'circle') {
      const cp = prim as unknown as CirclePrimitive;
      shapeFields = `
        ${this.numField('Radius', 'radius', cp.props.radius, 0.01, 50, 0.05, dis)}
      `;
    } else if (p.type === 'ground') {
      const gp = prim as unknown as GroundPrimitive;
      shapeFields = `
        ${this.numField('Width', 'width', gp.props.width, 1, 200, 1, dis)}
      `;
    }

    this.container.innerHTML = `
      <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Properties</h3>
      <div class="space-y-2">
        <div class="flex items-center gap-2 mb-2">
          <span class="inline-block w-3 h-3 rounded" style="background:${p.color}"></span>
          <input type="color" value="${p.color}" data-prop="color" class="w-5 h-5 cursor-pointer bg-transparent border-0 p-0" />
          <span class="text-xs text-gray-400">${p.type}</span>
        </div>
        ${this.textField('Label', 'label', p.label, dis)}
        <div class="grid grid-cols-2 gap-1">
          ${this.numField('X', 'positionX', p.position.x, -1000, 1000, 0.1, dis)}
          ${this.numField('Y', 'positionY', p.position.y, -1000, 1000, 0.1, dis)}
        </div>
        ${this.numField('Angle (deg)', 'angle', (p.angle * 180 / Math.PI), -360, 360, 1, dis)}
        ${shapeFields}
        ${p.type !== 'ground' ? `
          <div class="border-t border-gray-700 pt-2 mt-2">
            <span class="text-[10px] text-gray-500 uppercase">Physics</span>
          </div>
          ${this.numField('Density', 'density', p.density, 0, 100, 0.1, dis)}
          ${this.numField('Friction', 'friction', p.friction, 0, 1, 0.05, dis)}
          ${this.numField('Restitution', 'restitution', p.restitution, 0, 1, 0.05, dis)}
          ${this.numField('Lin. Damping', 'linearDamping', p.linearDamping, 0, 50, 0.1, dis)}
          ${this.numField('Ang. Damping', 'angularDamping', p.angularDamping, 0, 50, 0.1, dis)}
          ${this.checkField('Fixed Rotation', 'fixedRotation', p.fixedRotation, dis)}
        ` : `
          <div class="border-t border-gray-700 pt-2 mt-2">
            <span class="text-[10px] text-gray-500 uppercase">Surface</span>
          </div>
          ${this.numField('Friction', 'friction', p.friction, 0, 1, 0.05, dis)}
          ${this.numField('Restitution', 'restitution', p.restitution, 0, 1, 0.05, dis)}
        `}
      </div>
    `;

    // Bind change events
    this.container.querySelectorAll<HTMLInputElement>('[data-prop]').forEach((input) => {
      const prop = input.dataset.prop!;
      const handler = () => this.applyChange(prim, prop, input);
      // Number inputs: only fire on Enter/blur/spinner to avoid
      // intermediate values during typing (e.g. "1" → "" → "5")
      input.addEventListener('change', handler);
      // Text and color inputs: live updates are fine
      if (input.type === 'text' || input.type === 'color') {
        input.addEventListener('input', handler);
      }
    });
  }

  private applyChange(prim: Primitive, prop: string, input: HTMLInputElement): void {
    const p = prim.props as any;
    const body = this.physicsWorld.getBody(prim.id);

    switch (prop) {
      case 'label':
        p.label = input.value;
        break;
      case 'color':
        p.color = input.value;
        break;
      case 'positionX': {
        const v = parseFloat(input.value);
        if (isNaN(v)) return;
        p.position.x = v;
        if (body) { body.setPosition(new planck.Vec2(v, p.position.y)); body.setAwake(true); }
        break;
      }
      case 'positionY': {
        const v = parseFloat(input.value);
        if (isNaN(v)) return;
        p.position.y = v;
        if (body) { body.setPosition(new planck.Vec2(p.position.x, v)); body.setAwake(true); }
        break;
      }
      case 'angle': {
        const deg = parseFloat(input.value);
        if (isNaN(deg)) return;
        const rad = deg * Math.PI / 180;
        p.angle = rad;
        if (body) { body.setAngle(rad); body.setAwake(true); }
        break;
      }
      case 'width':
      case 'height':
      case 'radius': {
        const v = parseFloat(input.value);
        if (isNaN(v) || v <= 0) return;
        p[prop] = v;
        this.recreateFixture(prim);
        break;
      }
      case 'density':
      case 'friction':
      case 'restitution': {
        const v = parseFloat(input.value);
        if (isNaN(v)) return;
        p[prop] = v;
        this.recreateFixture(prim);
        break;
      }
      case 'linearDamping': {
        const v = parseFloat(input.value);
        if (isNaN(v)) return;
        p.linearDamping = v;
        if (body) body.setLinearDamping(v);
        break;
      }
      case 'angularDamping': {
        const v = parseFloat(input.value);
        if (isNaN(v)) return;
        p.angularDamping = v;
        if (body) body.setAngularDamping(v);
        break;
      }
      case 'fixedRotation': {
        p.fixedRotation = input.checked;
        if (body) body.setFixedRotation(input.checked);
        break;
      }
    }

    this.eventBus.emit('primitive:property-changed', { id: prim.id, key: prop, value: (p as any)[prop] });
  }

  /** Destroy and recreate the fixture to apply shape/density/friction changes */
  private recreateFixture(prim: Primitive): void {
    const body = this.physicsWorld.getBody(prim.id);
    if (!body) return;

    // Remove existing fixtures
    let f = body.getFixtureList();
    while (f) {
      const next = f.getNext();
      body.destroyFixture(f);
      f = next;
    }

    // Create new shape
    const p = prim.props as any;
    let shape: planck.Shape;
    if (p.type === 'rectangle') {
      shape = new planck.Box(p.width / 2, p.height / 2);
    } else if (p.type === 'circle') {
      shape = new planck.Circle(p.radius);
    } else if (p.type === 'ground') {
      const halfW = p.width / 2;
      shape = new planck.Edge(new planck.Vec2(-halfW, 0), new planck.Vec2(halfW, 0));
    } else {
      return;
    }

    body.createFixture({
      shape,
      density: p.density,
      friction: p.friction,
      restitution: p.restitution,
    });

    // Reset mass data after fixture changes
    body.resetMassData();
    body.setAwake(true);
  }

  private numField(label: string, prop: string, value: number, min: number, max: number, step: number, dis: string): string {
    return `
      <div class="flex items-center justify-between">
        <label class="text-[11px] text-gray-500 shrink-0">${label}</label>
        <input type="number" data-prop="${prop}" value="${Number(value.toFixed(4))}" min="${min}" max="${max}" step="${step}" ${dis}
          class="w-20 bg-gray-700 text-gray-200 text-xs px-1.5 py-0.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-40" />
      </div>
    `;
  }

  private textField(label: string, prop: string, value: string, dis: string): string {
    return `
      <div class="flex items-center justify-between">
        <label class="text-[11px] text-gray-500 shrink-0">${label}</label>
        <input type="text" data-prop="${prop}" value="${value}" ${dis}
          class="w-24 bg-gray-700 text-gray-200 text-xs px-1.5 py-0.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-40" />
      </div>
    `;
  }

  private checkField(label: string, prop: string, checked: boolean, dis: string): string {
    return `
      <div class="flex items-center justify-between">
        <label class="text-[11px] text-gray-500">${label}</label>
        <input type="checkbox" data-prop="${prop}" ${checked ? 'checked' : ''} ${dis}
          class="accent-blue-500" />
      </div>
    `;
  }
}
