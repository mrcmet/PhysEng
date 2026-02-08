import type { EventBus } from '../../core/EventBus';
import type { AppState } from '../../core/AppState';
import type { PhysicsWorld } from '../../physics/PhysicsWorld';
import { PhysicsConfig } from '../../physics/PhysicsConfig';

export class SimSettingsPanel {
  private container: HTMLElement;
  private appState: AppState;
  private physicsWorld: PhysicsWorld;
  private eventBus: EventBus;

  constructor(container: HTMLElement, appState: AppState, physicsWorld: PhysicsWorld, eventBus: EventBus) {
    this.container = container;
    this.appState = appState;
    this.physicsWorld = physicsWorld;
    this.eventBus = eventBus;

    this.eventBus.on('simulation:state-changed', () => this.refresh());
    this.render();
  }

  refresh(): void {
    this.render();
  }

  private render(): void {
    const editing = this.appState.simulationState === 'editing';
    const dis = editing ? '' : 'disabled';
    const currentTimestep = this.physicsWorld.getFixedTimestep();
    const gravity = this.physicsWorld.getGravity();

    this.container.innerHTML = `
      <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Simulation</h3>
      <div class="space-y-2">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-gray-500">Timestep</label>
          <select id="timestep-select" ${dis}
            class="w-full bg-gray-700 text-gray-200 text-xs px-1.5 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-40">
            ${PhysicsConfig.timestepPresets.map((preset) => `
              <option value="${preset.value}" ${Math.abs(preset.value - currentTimestep) < 0.0001 ? 'selected' : ''}>
                ${preset.label}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="border-t border-gray-700 pt-2 mt-2">
          <span class="text-[10px] text-gray-500 uppercase">Gravity (m/s²)</span>
        </div>

        <div class="grid grid-cols-2 gap-1">
          <div class="flex flex-col gap-1">
            <label class="text-[11px] text-gray-500">X</label>
            <input type="number" id="gravity-x" value="${gravity.x.toFixed(2)}" step="0.1" ${dis}
              class="w-full bg-gray-700 text-gray-200 text-xs px-1.5 py-0.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-40" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[11px] text-gray-500">Y</label>
            <input type="number" id="gravity-y" value="${gravity.y.toFixed(2)}" step="0.1" ${dis}
              class="w-full bg-gray-700 text-gray-200 text-xs px-1.5 py-0.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-40" />
          </div>
        </div>

        ${!editing ? `
          <p class="text-[10px] text-amber-500 mt-2">
            Reset simulation to change settings
          </p>
        ` : ''}
      </div>
    `;

    // Bind change events
    const timestepSelect = this.container.querySelector<HTMLSelectElement>('#timestep-select');
    const gravityXInput = this.container.querySelector<HTMLInputElement>('#gravity-x');
    const gravityYInput = this.container.querySelector<HTMLInputElement>('#gravity-y');

    if (timestepSelect) {
      timestepSelect.addEventListener('change', () => {
        const value = parseFloat(timestepSelect.value);
        if (!isNaN(value)) {
          this.physicsWorld.setFixedTimestep(value);
        }
      });
    }

    if (gravityXInput && gravityYInput) {
      const updateGravity = () => {
        const x = parseFloat(gravityXInput.value);
        const y = parseFloat(gravityYInput.value);
        if (!isNaN(x) && !isNaN(y)) {
          this.physicsWorld.setGravity(x, y);
        }
      };

      gravityXInput.addEventListener('change', updateGravity);
      gravityXInput.addEventListener('input', updateGravity);
      gravityYInput.addEventListener('change', updateGravity);
      gravityYInput.addEventListener('input', updateGravity);
    }
  }
}
